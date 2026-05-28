"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  Tag,
  Layers,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  description: string;
  hsnCode: string;
  gstRate: number;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = ["BATTERY", "TYRE", "ENGINE_OIL", "LUBRICANT", "OTHER"];
const CATEGORY_LABELS: Record<string, string> = {
  BATTERY: "Battery",
  TYRE: "Tyre",
  ENGINE_OIL: "Engine Oil",
  LUBRICANT: "Lubricant",
  OTHER: "Other",
};
const CATEGORY_COLORS: Record<string, string> = {
  BATTERY: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  TYRE: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  ENGINE_OIL: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  LUBRICANT: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  OTHER: "bg-foreground/8 text-foreground/50 border-white/10",
};

// ── Default Form ───────────────────────────────────────────────────────────

const defaultForm = {
  name: "",
  brand: "",
  category: "BATTERY",
  sku: "",
  description: "",
  hsnCode: "8507",
  gstRate: "0.28",
  sellingPrice: "",
  costPrice: "",
  stockQty: "",
  lowStockThreshold: "2",
};

// ── Helper ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?includeInactive=true`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    const matchActive = showInactive ? true : p.isActive;
    return matchSearch && matchCategory && matchActive;
  });

  const lowStockCount = products.filter((p) => p.isActive && p.stockQty <= p.lowStockThreshold).length;
  const totalActive = products.filter((p) => p.isActive).length;

  // ── Form Handlers ──────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      sku: product.sku,
      description: product.description,
      hsnCode: product.hsnCode,
      gstRate: String(product.gstRate),
      sellingPrice: String(product.sellingPrice),
      costPrice: String(product.costPrice),
      stockQty: String(product.stockQty),
      lowStockThreshold: String(product.lowStockThreshold),
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      gstRate: parseFloat(form.gstRate),
      sellingPrice: parseFloat(form.sellingPrice),
      costPrice: parseFloat(form.costPrice) || 0,
      stockQty: parseInt(form.stockQty) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 2,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      fetchProducts();
    } catch {
      /* noop */
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setDeletingId(null);
      fetchProducts();
    } catch {
      /* noop */
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Parts & Products Catalog
          </h1>
          <p className="text-xs text-foreground/40 mt-1">
            Manage parts sold on-site by technicians during service calls.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary/25 cursor-pointer"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Products", value: totalActive, icon: CheckCircle2, color: "text-success" },
          { label: "Low Stock", value: lowStockCount, icon: TrendingDown, color: "text-warning", alert: lowStockCount > 0 },
          { label: "Total SKUs", value: products.length, icon: Layers, color: "text-primary" },
          { label: "Categories", value: CATEGORIES.length, icon: Tag, color: "text-secondary" },
        ].map((card) => (
          <div
            key={card.label}
            className={`bg-card border rounded-xl p-4 flex items-center gap-3 ${card.alert ? "border-warning/30" : "border-white/8"}`}
          >
            <card.icon size={18} className={card.color} />
            <div>
              <p className="text-lg font-black text-white">{card.value}</p>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-white/8 rounded-xl text-xs text-white placeholder-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-card border border-white/8 rounded-xl text-xs text-foreground/70 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 bg-card border border-white/8 rounded-xl text-xs text-foreground/50">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="accent-primary"
          />
          Show Inactive
        </label>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Loading Catalog...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={36} className="text-foreground/15 mx-auto mb-3" />
          <p className="text-white font-bold text-sm">No products found</p>
          <p className="text-foreground/40 text-xs mt-1">Try adjusting filters or add your first product.</p>
        </div>
      ) : (
        <div className="bg-card border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6">
                  {["Product", "SKU / HSN", "Category", "Selling Price", "Stock", "GST", "Status", "Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[9px] font-black text-foreground/35 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const isLow = product.isActive && product.stockQty <= product.lowStockThreshold;
                  return (
                    <tr
                      key={product._id}
                      className={`border-b border-white/4 hover:bg-white/2 transition-colors ${!product.isActive ? "opacity-50" : ""}`}
                    >
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{product.name}</p>
                        <p className="text-foreground/40 text-[10px] mt-0.5">{product.brand}</p>
                      </td>

                      {/* SKU / HSN */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-foreground/60 text-[10px]">{product.sku}</p>
                        <p className="text-foreground/35 text-[9px] mt-0.5">HSN: {product.hsnCode}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${CATEGORY_COLORS[product.category]}`}>
                          {CATEGORY_LABELS[product.category]}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <p className="font-black text-white">₹{fmt(product.sellingPrice)}</p>
                        {product.costPrice > 0 && (
                          <p className="text-[9px] text-foreground/35 mt-0.5">Cost: ₹{fmt(product.costPrice)}</p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className={`flex items-center gap-1.5 ${isLow ? "text-warning" : "text-success"}`}>
                          {isLow && <AlertTriangle size={11} />}
                          <span className="font-black">{product.stockQty}</span>
                          <span className="text-foreground/30 text-[9px]">units</span>
                        </div>
                        {isLow && (
                          <p className="text-[9px] text-warning/70 mt-0.5">Low stock!</p>
                        )}
                      </td>

                      {/* GST */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-foreground/60 text-[10px]">
                          {(product.gstRate * 100).toFixed(0)}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="flex items-center gap-1.5 cursor-pointer"
                          title={product.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          {product.isActive ? (
                            <><ToggleRight size={18} className="text-success" /><span className="text-[9px] text-success font-bold">Active</span></>
                          ) : (
                            <><ToggleLeft size={18} className="text-foreground/30" /><span className="text-[9px] text-foreground/30 font-bold">Inactive</span></>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeletingId(product._id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-foreground/40 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Product Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Amaron 45Ah Battery"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Brand *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Amaron"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      // Auto-fill HSN & GST rate based on category
                      const hsnMap: Record<string, string> = { BATTERY: "8507", TYRE: "4011", ENGINE_OIL: "2710", LUBRICANT: "3403", OTHER: "9999" };
                      const gstMap: Record<string, string> = { BATTERY: "0.28", TYRE: "0.28", ENGINE_OIL: "0.18", LUBRICANT: "0.18", OTHER: "0.18" };
                      setForm({ ...form, category: cat, hsnCode: hsnMap[cat] || "9999", gstRate: gstMap[cat] || "0.18" });
                    }}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-foreground/70 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>

                {/* SKU */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">SKU *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. BAT-45AH-AMR"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 font-mono focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* HSN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">HSN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 8507"
                    value={form.hsnCode}
                    onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 font-mono focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* GST Rate */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">GST Rate</label>
                  <select
                    value={form.gstRate}
                    onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-foreground/70 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  >
                    <option value="0.05">5%</option>
                    <option value="0.12">12%</option>
                    <option value="0.18">18%</option>
                    <option value="0.28">28%</option>
                  </select>
                </div>

                {/* Selling Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Selling Price (₹) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="GST inclusive price"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Cost Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Purchase cost (internal)"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stockQty}
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Low Stock Threshold */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Low Stock Alert At</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short product description for invoice..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background/40 border border-white/8 rounded-xl text-xs text-white placeholder-foreground/25 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-foreground/60 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Delete Product?</h3>
                <p className="text-xs text-foreground/40 mt-0.5">This cannot be undone. Consider deactivating instead.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-foreground/60 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
