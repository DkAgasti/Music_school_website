"use client";

import { useState, useEffect } from "react";
import {
  apiGetProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
} from "@/Api/admin/shopProductApi";
import { apiUploadImage } from "@/Api/admin/uploadApi";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

function formatRupees(pricePaise) {
  const rupees = Math.round((pricePaise || 0) / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function getStockStatus(stock) {
  if (!stock || stock <= 0) return "Out of Stock";
  if (stock <= 2) return "Low Stock";
  return "In Stock";
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Instruments",
    price: "",
    deliveryCharge: "",
    stock: 10,
    imageUrl: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    category: "Instruments",
    price: "",
    deliveryCharge: "",
    stock: 10,
    active: "Active",
    imageUrl: "",
  });

  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  async function handlePhotoFileChange(e, target) {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = target === "add" ? setUploadingAdd : setUploadingEdit;
    const setFormState = target === "add" ? setForm : setEditForm;

    setUploading(true);
    const url = await apiUploadImage(file, "products");
    setUploading(false);

    if (url) setFormState((prev) => ({ ...prev, imageUrl: url }));
  }

  useEffect(() => {
    loadProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadProducts(pageToLoad) {
    setLoading(true);
    const res = await apiGetProducts({ page: pageToLoad, limit: PAGE_SIZE });
    if (res && Array.isArray(res.items)) {
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setTotalProducts(res.total);
    }
    setLoading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const stockNum = parseInt(form.stock, 10) || 0;
    const priceNum = Number(String(form.price).replace(/[^0-9.]/g, "")) || 0;
    const deliveryChargeNum = Number(String(form.deliveryCharge).replace(/[^0-9.]/g, "")) || 0;
    const created = await apiCreateProduct({
      name: form.name,
      category: form.category,
      price: priceNum,
      deliveryCharge: deliveryChargeNum,
      stock: stockNum,
      imageUrls: form.imageUrl ? [form.imageUrl] : [],
    });
    if (created) {
      setShowModal(false);
      setForm({ name: "", category: "Instruments", price: "", deliveryCharge: "", stock: 10, imageUrl: "" });
      setPage(1);
      loadProducts(1);
    }
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      category: product.category || "Instruments",
      price: String(Math.round((product.price || 0) / 100)),
      deliveryCharge: String(Math.round((product.deliveryCharge || 0) / 100)),
      stock: product.stock ?? 0,
      active: product.active === false ? "Inactive" : "Active",
      imageUrl:
        Array.isArray(product.imageUrls) && product.imageUrls.length > 0
          ? product.imageUrls[0]
          : "",
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingProduct) return;
    const stockNum = parseInt(editForm.stock, 10) || 0;
    const priceNum = Number(String(editForm.price).replace(/[^0-9.]/g, "")) || 0;
    const deliveryChargeNum = Number(String(editForm.deliveryCharge).replace(/[^0-9.]/g, "")) || 0;
    const updated = await apiUpdateProduct(editingProduct.id, {
      name: editForm.name,
      category: editForm.category,
      price: priceNum,
      deliveryCharge: deliveryChargeNum,
      stock: stockNum,
      active: editForm.active === "Active",
      imageUrls: editForm.imageUrl ? [editForm.imageUrl] : [],
    });
    if (updated) {
      setEditingProduct(null);
      loadProducts(page);
    }
  }

  async function handleDeleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const ok = await apiDeleteProduct(id);
    if (ok) {
      loadProducts(page);
    }
  }

  function renderStockBadge(status) {
    if (status === "In Stock") {
      return (
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#E8F8EE] px-3.5 py-0.5 text-xs font-medium text-[#16A34A]">
          In Stock
        </span>
      );
    }
    if (status === "Low Stock") {
      return (
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#FEF3E2] px-3.5 py-0.5 text-xs font-medium text-[#D97706]">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#FFE4E6] px-3.5 py-0.5 text-xs font-medium text-[#E11D48]">
        Out of Stock
      </span>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Shop Products
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage products listed on the shop
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Product
        </button>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Product Inventory
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {totalProducts} Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No products in inventory.
                  </td>
                </tr>
              ) : (
                products.map((row) => {
                  const status = getStockStatus(row.stock);
                  return (
                    <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-gray-800">
                        <div className="flex items-center gap-2.5">
                          {row.imageUrls?.[0] ? (
                            <img
                              src={row.imageUrls[0]}
                              alt={row.name}
                              className="h-9 w-9 shrink-0 rounded-lg object-cover border border-[#F3E2EC]"
                            />
                          ) : (
                            <div className="h-9 w-9 shrink-0 rounded-lg bg-[#FDEEF5] flex items-center justify-center text-[#E11D48] text-xs font-bold border border-[#F3E2EC]">
                              ♪
                            </div>
                          )}
                          {row.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{row.category}</td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">{formatRupees(row.price)}</td>
                      <td className="px-4 py-3.5 text-gray-600 font-mono text-xs whitespace-nowrap">{row.stock} units</td>
                      <td className="px-4 py-3.5 text-center">
                        {renderStockBadge(status)}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* 1. Edit Icon */}
                          <button
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Product"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* 2. Delete Icon */}
                          <button
                            onClick={() => handleDeleteProduct(row.id, row.name)}
                            title="Delete Product"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Add New Product
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Classic Acoustic Guitar"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="Instruments">Instruments</option>
                  <option value="Books">Books</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  required
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 12000"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Available Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Charges (₹)
                </label>
                <input
                  type="text"
                  value={form.deliveryCharge}
                  onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })}
                  placeholder="0 = Free delivery"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-12 w-12 rounded-lg object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingAdd ? "Uploading…" : form.imageUrl ? "Change photo" : "Upload photo from your computer"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoFileChange(e, "add")}
                      disabled={uploadingAdd}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="or paste an image URL"
                  className="mt-2 w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-600 focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Product
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Instruments">Instruments</option>
                    <option value="Books">Books</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Active
                  </label>
                  <select
                    value={editForm.active}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Charges (₹)
                </label>
                <input
                  type="text"
                  value={editForm.deliveryCharge}
                  onChange={(e) => setEditForm({ ...editForm, deliveryCharge: e.target.value })}
                  placeholder="0 = Free delivery"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {editForm.imageUrl ? (
                    <img
                      src={editForm.imageUrl}
                      alt="Preview"
                      className="h-12 w-12 rounded-lg object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingEdit ? "Uploading…" : editForm.imageUrl ? "Change photo" : "Upload photo from your computer"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoFileChange(e, "edit")}
                      disabled={uploadingEdit}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  placeholder="or paste an image URL"
                  className="mt-2 w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-600 focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
