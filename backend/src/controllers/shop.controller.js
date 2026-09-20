import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder as createRazorpayOrder } from "../services/razorpay.service.js";

// ─── Products ─────────────────────────────────────────────────────────────────

export const listProducts = asyncHandler(async (req, res) => {
  const { active, search, category } = req.query;

  const where = {};
  if (active !== undefined) where.active = active === "true";
  if (category && category !== "All") where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse(res, 200, products);
});

export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
  });

  if (!product) return next(new ApiError(404, "Product not found"));
  return ApiResponse(res, 200, product);
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, slug, description, category = "Instruments", price, imageUrls = [], stock = 0, active = true } = req.body;

  if (!name || !price) {
    return next(new ApiError(400, "name and price (in rupees or paise) are required"));
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const priceInPaise = Math.round(price > 50000 ? price : price * 100);

  const product = await prisma.product.create({
    data: {
      name,
      slug: generatedSlug,
      description: description || "",
      category,
      price: priceInPaise,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls].filter(Boolean),
      stock: parseInt(stock, 10) || 0,
      active: Boolean(active),
    },
  });

  return ApiResponse(res, 201, product);
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { name, slug, description, price, imageUrls, stock, active } = req.body;

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Product not found"));

  const data = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Math.round(price > 50000 ? price : price * 100);
  if (imageUrls !== undefined) data.imageUrls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  if (stock !== undefined) data.stock = parseInt(stock, 10);
  if (active !== undefined) data.active = Boolean(active);

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data,
  });

  return ApiResponse(res, 200, updated);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Product not found"));

  await prisma.product.delete({ where: { id: req.params.id } });
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
  const totalAmountPaise = product.price * qty;

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
  const { status, search } = req.query;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { buyerName: { contains: search, mode: "insensitive" } },
      { buyerEmail: { contains: search, mode: "insensitive" } },
      { buyerPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { product: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse(res, 200, orders);
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
