import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetOrders(params = {}) {
  try {
    const response = await axiosClient.get("/shop/orders", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch orders"));
    return null;
  }
}

export async function apiUpdateOrderStatus(id, status) {
  try {
    const response = await axiosClient.patch(`/shop/orders/${id}/status`, { status });
    toast.success("Order status updated");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update order status"));
    return null;
  }
}
