"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Search, Edit3, Trash2, AlertTriangle,
  CheckCircle2, X, ChevronDown, Zap, BarChart3, Archive
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string | null;
  category: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  unit: string;
  isActive: boolean;
}

const CATEGORIES = ["BATTERY", "TYRE", "OIL", "TOOLS", "ACCESSORIES", "OTHER"];
const UNITS = ["pcs", "litre", "set", "pair", "kg"];

const CATEGORY_COLORS: Record<string, string> = {
  BATTERY: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  TYRE: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  OIL: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  TOOLS: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  ACCESSORIES: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  OTHER: "text-gray-400 bg-gray-400/10 border-gray-400/30",
};

const empty = { name: '', sku: '', category: 'BATTERY', description: '', sellingPrice: '', costPrice: '', stock: '', unit: 'pcs' };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof empty>({ ...empty });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) {
      showToast('Failed to load products', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...empty });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category,
      description: p.description,
      sellingPrice: String(p.sellingPrice),
      costPrice: String(p.costPrice),
      stock: String(p.stock),
      unit: p.unit,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        sellingPrice: Number(form.sellingPrice),
        costPrice: Number(form.costPrice),
        stock: Number(form.stock),
      };
      const url = editing ? `/api/products/${editing._id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editing ? 'Product updated!' : 'Product added!');
        setShowModal(false);
        fetchProducts();
      } else {
        showToast(data.error || 'Failed to save', false);
      }
    } catch {
      showToast('Network error', false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from inventory?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product removed.');
        setProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch {
      showToast('Failed to remove', false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((s, p) => s + p.sellingPrice * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 3 && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm ${toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Package className="text-primary" size={22} />
            </div>
            Hub Inventory
          </h1>
          <p className="text-foreground/50 text-sm mt-1">Manage products sold during service calls</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/30 active:scale-95"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', value: products.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Hub Value', value: `₹${totalValue.toLocaleString('en-IN')}`, icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Out of Stock', value: outOfStock, icon: Archive, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={color} size={20} />
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider">{label}</p>
              <p className="text-white font-black text-xl">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-foreground/40 focus:outline-none focus:border-primary/60"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                filterCat === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-foreground/50 border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Package className="mx-auto text-foreground/20" size={56} />
          <p className="text-foreground/40 font-semibold">
            {search || filterCat !== 'ALL' ? 'No products match your filters.' : 'No products yet. Add your first product!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm leading-tight truncate pr-2">{product.name}</h3>
                  {product.sku && <p className="text-foreground/40 text-xs mt-0.5 font-mono">{product.sku}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${CATEGORY_COLORS[product.category] || CATEGORY_COLORS.OTHER}`}>
                  {product.category}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/50 text-xs">Selling Price</span>
                  <span className="text-white font-black text-lg">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/50 text-xs">Stock</span>
                  <span className={`font-bold text-sm px-2 py-0.5 rounded-lg ${
                    product.stock === 0 ? 'text-red-400 bg-red-400/10' :
                    product.stock <= 3 ? 'text-yellow-400 bg-yellow-400/10' :
                    'text-emerald-400 bg-emerald-400/10'
                  }`}>
                    {product.stock} {product.unit}
                    {product.stock === 0 && ' — OUT'}
                    {product.stock > 0 && product.stock <= 3 && ' — LOW'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-white text-xs font-semibold transition-all"
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white">
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <X size={16} className="text-white" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Amaron 65Ah Car Battery"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-foreground/30 focus:outline-none focus:border-primary/60"
                  />
                </div>

                {/* SKU + Category Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">SKU</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                      placeholder="BAT-AMR-65AH"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-foreground/30 focus:outline-none focus:border-primary/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/60 appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Prices Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Selling Price (₹) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.sellingPrice}
                      onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
                      placeholder="4500"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-foreground/30 focus:outline-none focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Cost Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.costPrice}
                      onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))}
                      placeholder="3200"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-foreground/30 focus:outline-none focus:border-primary/60"
                    />
                  </div>
                </div>

                {/* Stock + Unit Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-foreground/30 focus:outline-none focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Unit</label>
                    <select
                      value={form.unit}
                      onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/60"
                    >
                      {UNITS.map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional product details..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-foreground/30 focus:outline-none focus:border-primary/60 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-foreground/60 text-sm font-semibold hover:border-white/20 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
