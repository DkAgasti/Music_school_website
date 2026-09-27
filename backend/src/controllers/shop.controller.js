import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder as createRazorpayOrder } from "../services/razorpay.service.js";
import { cached, invalidate } from "../utils/cache.js";

const TTL = 60_000;

// ─── Products ─────────────────────────────────────────────────────────────────

export const listProducts = asyncHandler(async (req, res) => {
  const { active, search, category, page, limit } = req.query;

  const where = {};
  if (active !== undefined) where.active = active === "true";
  if (category && category !== "All") where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const isPaginated = page !== undefined;

  // Only cache the common, filterless, unpaginated "browse the shop" call —
  // a search/filter/page query is cheap and specific enough not to need it.
  const hasFilters = active !== undefined || (category && category !== "All") || search;
  if (!isPaginated) {
    const products = hasFilters
      ? await prisma.product.findMany({ where, orderBy: { createdAt: "desc" } })
      : await cached("shop:products:list", TTL, () =>
          prisma.product.findMany({ where, orderBy: { createdAt: "desc" } })
        );
    return ApiResponse(res, 200, products);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return ApiResponse(res, 200, {
    items,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await cached(`shop:products:${req.params.slug}`, TTL, () =>
    prisma.product.findUnique({ where: { slug: req.params.slug } })
  );

  if (!product) return next(new ApiError(404, "Product not found"));
  return ApiResponse(res, 200, product);
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, slug, description, category = "Instruments", price, deliveryCharge = 0, imageUrls = [], stock = 0, active = true } = req.body;

  if (!name || !price) {
    return next(new ApiError(400, "name and price (in rupees or paise) are required"));
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // price/deliveryCharge always arrive in rupees from the admin form — never
  // guess the unit from magnitude, that silently corrupts anything ≥ ₹50,000.
  const priceInPaise = Math.round(price * 100);
  const deliveryChargeInPaise = Math.round(deliveryCharge * 100);

  const product = await prisma.product.create({
    data: {
      name,
      slug: generatedSlug,
      description: description || "",
      category,
      price: priceInPaise,
      deliveryCharge: deliveryChargeInPaise || 0,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls].filter(Boolean),
      stock: parseInt(stock, 10) || 0,
      active: Boolean(active),
    },
  });

  invalidate("shop:products");
  return ApiResponse(res, 201, product);
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { name, slug, description, price, deliveryCharge, imageUrls, stock, active } = req.body;

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Product not found"));

  const data = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Math.round(price * 100);
  if (deliveryCharge !== undefined) {
    data.deliveryCharge = Math.round(deliveryCharge * 100) || 0;
  }
  if (imageUrls !== undefined) data.imageUrls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  if (stock !== undefined) data.stock = parseInt(stock, 10);
  if (active !== undefined) data.active = Boolean(active);

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data,
  });

  invalidate("shop:products");
  return ApiResponse(res, 200, updated);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Product not found"));

  await prisma.product.delete({ where: { id: req.params.id } });
  invalidate("shop:products");
  return ApiResponse(res, 200, { message: "Product deleted successfully", id: req.params.id });
});

// ─── Orders (Direct Buy Now) ─────────────────────────────────────────────────

export const createShopOrder = asyncHandler(async (req, res, next) => {
  const {
    productId,
    buyerName,
    buyerEmail,
    buyerPhone,
    buyerAddress,
    quantity = 1,
    // also fallback for shorthand payload
    name,
    email,
    phone,
    address,
  } = req.body;

  const finalName = buyerName || name;
  const finalEmail = buyerEmail || email;
  const finalPhone = buyerPhone || phone;
  const finalAddress = buyerAddress || address;

  if (!productId || !finalName || !finalEmail || !finalPhone) {
    return next(new ApiError(400, "productId, buyerName, buyerEmail, and buyerPhone are required"));
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return next(new ApiError(404, "Product not found"));
  if (!product.active) return next(new ApiError(400, "Product is currently inactive"));

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  if (qty > product.stock) {
    return next(new ApiError(400, `Only ${product.stock} unit(s) of "${product.name}" available in stock`));
  }
  const totalAmountPaise = product.price * qty + (product.deliveryCharge || 0);

  // Create order
  const order = await prisma.order.create({
    data: {
      productId,
      buyerName: finalName,
      buyerEmail: finalEmail,
      buyerPhone: finalPhone,
      buyerAddress: finalAddress || null,
      quantity: qty,
      status: "PENDING",
    },
    include: { product: true },
  });

  // Create Razorpay order
  const receipt = `ord_${order.id.slice(-8)}`;
  const razorpayOrder = await createRazorpayOrder(totalAmountPaise, receipt);

  // Create Payment record
  const payment = await prisma.payment.create({
    data: {
      amount: totalAmountPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      purpose: "SHOP_ORDER",
      orderId: order.id,
      status: "CREATED",
    },
  });

  return ApiResponse(res, 201, {
    order,
    payment,
    razorpayOrder,
    razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { status, search, page, limit } = req.query;

  // A "Pending" order is checkout-started-but-never-paid — not a real order,
  // so it's excluded unless a caller explicitly asks for that exact status.
  const where = status ? { status } : { status: { not: "PENDING" } };
  if (search) {
    where.OR = [
      { buyerName: { contains: search, mode: "insensitive" } },
      { buyerEmail: { contains: search, mode: "insensitive" } },
      { buyerPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  // No `page` param → unpaginated array, kept for any existing caller that
  // still expects a plain list.
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { product: true, payment: true },
      orderBy: { createdAt: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.order.count({ where }) : Promise.resolve(null),
  ]);

  if (!isPaginated) return ApiResponse(res, 200, orders);

  return ApiResponse(res, 200, {
    items: orders,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, `Invalid order status. Must be one of: ${validStatuses.join(", ")}`));
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return next(new ApiError(404, "Order not found"));

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { product: true, payment: true },
  });

  return ApiResponse(res, 200, updated);
});
