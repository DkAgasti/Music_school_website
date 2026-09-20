import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createShopOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/shop.controller.js";

const router = Router();

// Public routes
router.get("/products", listProducts);
router.get("/products/:slug", getProductBySlug);
router.post("/orders", createShopOrder);

// Admin routes
router.post("/products", requireAuth, createProduct);
router.patch("/products/:id", requireAuth, updateProduct);
router.delete("/products/:id", requireAuth, deleteProduct);

router.get("/orders", requireAuth, listOrders);
router.patch("/orders/:id/status", requireAuth, updateOrderStatus);

export default router;
