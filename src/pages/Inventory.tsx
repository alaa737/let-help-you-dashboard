import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';

const CATEGORIES = ['Vape Devices', 'Liquids', 'Pods', 'Coils', 'Disposable', 'Accessories'];

const Inventory = () => {
  const products = useLiveQuery(() => db.products.toArray());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    lowStockLimit: 3
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.products.update(editingId, formData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await db.products.add(formData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      handleClose();
    } catch (error) {
      toast.error('حدث خطأ ما');
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      category: p.category,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      lowStockLimit: p.lowStockLimit
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await db.products.delete(id);
      toast.info('تم حذف المنتج');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: CATEGORIES[0],
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      lowStockLimit: 3
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold">المخزن</h1>
          <p className="text-muted-foreground">إدارة المنتجات والمخزون</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          إضافة منتج
        </button>
      </header>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          className="input-luxury pr-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="luxury-card overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-white/5 text-silver uppercase text-xs">
            <tr>
              <th className="p-4">المنتج</th>
              <th className="p-4">الفئة</th>
              <th className="p-4">سعر الشراء</th>
              <th className="p-4">سعر البيع</th>
              <th className="p-4">الكمية</th>
              <th className="p-4">العمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredProducts?.map(product => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                <td className="p-4 text-sm">{product.purchasePrice} ج</td>
                <td className="p-4 text-sm text-gold font-bold">{product.sellingPrice} ج</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.quantity <= product.lowStockLimit ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-400'}`}>
                    {product.quantity}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="p-2 hover:text-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product.id!)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="luxury-card w-full max-w-lg bg-matte border-gold/30">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-gold" />
                {editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={handleClose}><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm mb-1 block">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    className="input-luxury"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">الفئة</label>
                  <select
                    className="input-luxury"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm mb-1 block">الكمية</label>
                  <input
                    type="number"
                    required
                    className="input-luxury"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">سعر الشراء</label>
                  <input
                    type="number"
                    required
                    className="input-luxury"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">سعر البيع</label>
                  <input
                    type="number"
                    required
                    className="input-luxury"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">حد التنبيه (النواقص)</label>
                  <input
                    type="number"
                    required
                    className="input-luxury"
                    value={formData.lowStockLimit}
                    onChange={(e) => setFormData({ ...formData, lowStockLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary mt-4">حفظ المنتج</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;