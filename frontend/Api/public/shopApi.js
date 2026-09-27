import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetProducts(params = {}) {
  try {
    const response = await axiosClient.get("/shop/products", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to load products"));
    return null;
  }
}

export async function apiGetProductBySlug(slug) {
  try {
    const response = await axiosClient.get(`/shop/products/${slug}`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to load product"));
    return null;
  }
}

// Creates a "Buy Now" order + Razorpay order + Payment record in one call.
// Returns { order, payment, razorpayOrder, razorpayKey }.
export async function apiCreateShopOrder(data) {
  try {
    const response = await axiosClient.post("/shop/orders", data);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to place order"));
    return null;
  }
}
