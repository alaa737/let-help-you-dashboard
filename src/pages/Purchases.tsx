import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { toast } from 'sonner';
import { Calendar, Plus } from 'lucide-react';

const Purchases = () => {
  const products = useLiveQuery(() => db.products.toArray());
  const purchases = useLiveQuery(() => db.purchases.orderBy('date').reverse().toArray());

  const [formData, setFormData] = useState({
    supplier: '',
    productId: 0,
    quantity: 0,
    purchasePrice: 0
  });

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productId === 0) return toast.error('اختر المنتج أولاً');

    try {
      const product = products?.find(p => p.id === Number(formData.productId));
      if (!product) return;

      const purchaseAmount = formData.purchasePrice * formData.quantity;

      await db.purchases.add({
        supplier: formData.supplier,
        productName: product.name,
        quantity: formData.quantity,
        purchasePrice: formData.purchasePrice,
        date: new Date()
      });

      await db.products.update(product.id!, { 
        quantity: product.quantity + formData.quantity,
        purchasePrice: formData.purchasePrice
      });

      await db.treasuryLogs.add({
        type: 'out',
        amount: purchaseAmount,
        reason: `مشتريات: ${product.name} من ${formData.supplier}`,
        date: new Date()
      });

      toast.success('تم تسجيل الشراء وتحديث المخزن');
      setFormData({ supplier: '', productId: 0, quantity: 0, purchasePrice: 0 });
    } catch (error) {
      toast.error('حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gold">المشتريات</h1>
        <p className="text-muted-foreground">تسجيل فواتير المشتريات وتوريد بضاعة</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="luxury-card p-6 h-fit sticky top-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold" />
            تسجيل فاتورة شراء
          </h2>
          <form onSubmit={handleAddPurchase} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">المورد</label>
              <input 
                type="text" 
                required 
                className="input-luxury" 
                value={formData.supplier}
                onChange={e => setFormData({...formData, supplier: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">المنتج</label>
              <select 
                required 
                className="input-luxury"
                value={formData.productId}
                onChange={e => {
                  const p = products?.find(prod => prod.id === Number(e.target.value));
                  setFormData({...formData, productId: Number(e.target.value), purchasePrice: p?.purchasePrice || 0});
                }}
              >
                <option value={0}>اختر منتج من المخزن</option>
                {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">الكمية</label>
                <input 
                  type="number" 
                  required 
                  className="input-luxury" 
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">سعر الشراء للقطعة</label>
                <input 
                  type="number" 
                  required 
                  className="input-luxury" 
                  value={formData.purchasePrice}
                  onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm mb-2">الإجمالي المنصرف: <span className="text-gold font-bold">{formData.purchasePrice * formData.quantity} ج</span></p>
              <button type="submit" className="w-full btn-primary">تأكيد الشراء</button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-silver" />
            سجل المشتريات
          </h2>
          <div className="luxury-card overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-white/5 text-xs">
                <tr>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">المورد</th>
                  <th className="p-4">المنتج</th>
                  <th className="p-4">الكمية</th>
                  <th className="p-4">التكلفة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {purchases?.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString('ar-EG')}</td>
                    <td className="p-4 font-medium">{p.supplier}</td>
                    <td className="p-4">{p.productName}</td>
                    <td className="p-4">{p.quantity}</td>
                    <td className="p-4 text-gold font-bold">{p.purchasePrice * p.quantity} ج</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;