import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder as createRazorpayOrder } from "../services/razorpay.service.js";

export const listProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany();
  return ApiResponse(res, 200, products);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
  return ApiResponse(res, 200, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  return ApiResponse(res, 201, product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
  return ApiResponse(res, 200, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { id: req.params.id });
});

export const createShopOrder = asyncHandler(async (req, res) => {
  const { productId, name, email, phone } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  const order = await prisma.order.create({ data: { productId, name, email, phone } });
  const razorpayOrder = await createRazorpayOrder(product.price * 100, `order_${order.id}`);

  return ApiResponse(res, 201, { order, razorpayOrder });
});

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { product: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, orders);
});
