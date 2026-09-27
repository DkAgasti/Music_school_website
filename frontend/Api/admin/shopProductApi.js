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
    toast.error(errMessage(error, "Failed to fetch products"));
    return null;
  }
}

// price is accepted in rupees (backend auto-converts to paise)
export async function apiCreateProduct(data) {
  try {
    const response = await axiosClient.post("/shop/products", data);
    toast.success("Product created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to create product"));
    return null;
  }
}

export async function apiUpdateProduct(id, data) {
  try {
    const response = await axiosClient.patch(`/shop/products/${id}`, data);
    toast.success("Product updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update product"));
    return null;
  }
}

export async function apiDeleteProduct(id) {
  try {
    await axiosClient.delete(`/shop/products/${id}`);
    toast.success("Product deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete product"));
    return false;
  }
}
