"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_PRODUCTS = [
  { id: "p-1", title: "Acoustic Guitar", category: "Instruments", price: "₹12,000", stock: 8, status: "In Stock" },
  { id: "p-2", title: "Digital Piano", category: "Instruments", price: "₹25,000", stock: 3, status: "Low Stock" },
  { id: "p-3", title: "Tabla Set", category: "Instruments", price: "₹8,000", stock: 5, status: "In Stock" },
  { id: "p-4", title: "Guitar Book – Level 1", category: "Books", price: "₹499", stock: 22, status: "In Stock" },
  { id: "p-5", title: "Piano Book – Level 1", category: "Books", price: "₹599", stock: 0, status: "Out of Stock" },
  { id: "p-6", title: "Violin", category: "Instruments", price: "₹9,500", stock: 4, status: "In Stock" },
];

export default function ProductsAdminPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "Instruments",
    price: "",
    stock: 10,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    category: "Instruments",
    price: "",
    stock: 10,
    status: "In Stock",
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get("/shop/products");
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((item) => {
            const stockVal = item.stock ?? 10;
            return {
              id: item.id,
              title: item.title || item.name,
              category: item.category || "Instruments",
              price: `₹${(item.price ? Math.round(item.price / 100) : 1000).toLocaleString("en-IN")}`,
              stock: stockVal,
              status: stockVal === 0 ? "Out of Stock" : stockVal < 4 ? "Low Stock" : "In Stock",
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.warn("Using template products:", err.message);
      }
    }
    loadProducts();
  }, []);

  function handleAddProduct(e) {
    e.preventDefault();
    const stockNum = parseInt(form.stock, 10) || 0;
    const newEntry = {
      id: `p-${Date.now()}`,
      title: form.title,
      category: form.category,
      price: form.price.startsWith("₹") ? form.price : `₹${form.price}`,
      stock: stockNum,
      status: stockNum === 0 ? "Out of Stock" : stockNum < 4 ? "Low Stock" : "In Stock",
    };
    // Prepend new product to top
    setProducts([newEntry, ...products]);
    setShowModal(false);
    setForm({ title: "", category: "Instruments", price: "", stock: 10 });
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setEditForm({
      title: product.title,
      category: product.category,
      price: product.price.replace("₹", "").trim(),
      stock: product.stock,
      status: product.status,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingProduct) return;
    const stockNum = parseInt(editForm.stock, 10) || 0;
    const cleanPrice = editForm.price.startsWith("₹") ? editForm.price : `₹${editForm.price}`;

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editingProduct.id
          ? {
              ...item,
              title: editForm.title,
              category: editForm.category,
              price: cleanPrice,
              stock: stockNum,
              status: editForm.status,
            }
          : item
      )
    );
    setEditingProduct(null);
  }

  function handleDeleteProduct(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }

  function handleToggleStockStatus(id) {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next =
            item.status === "In Stock"
              ? "Low Stock"
              : item.status === "Low Stock"
              ? "Out of Stock"
              : "In Stock";
          const newStock = next === "Out of Stock" ? 0 : next === "Low Stock" ? 2 : 10;
          return { ...item, status: next, stock: newStock };
        }
        return item;
      })
    );
  }

  function renderStockBadge(status) {
    if (status === "In Stock") {
      return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#E8F8EE] px-3.5 py-0.5 text-xs font-medium text-[#16A34A]">
          In Stock
        </span>
      );
    }
    if (status === "Low Stock") {
      return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3E2] px-3.5 py-0.5 text-xs font-medium text-[#D97706]">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#FFE4E6] px-3.5 py-0.5 text-xs font-medium text-[#E11D48]">
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
            {products.length} Products
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No products in inventory.
                  </td>
                </tr>
              ) : (
                products.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {row.title}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.category}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">{row.price}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">{row.stock} units</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStockStatus(row.id)}
                        title="Click to toggle stock status"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {renderStockBadge(row.status)}
                      </button>
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
                          onClick={() => handleDeleteProduct(row.id, row.title)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
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
