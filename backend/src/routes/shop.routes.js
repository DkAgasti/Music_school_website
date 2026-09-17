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
} from "../controllers/shop.controller.js";

const router = Router();

router.get("/products", listProducts);
router.get("/products/:slug", getProductBySlug);
router.post("/products", requireAuth, createProduct);
router.patch("/products/:id", requireAuth, updateProduct);
router.delete("/products/:id", requireAuth, deleteProduct);

router.post("/orders", createShopOrder);
router.get("/orders", requireAuth, listOrders);

export default router;
