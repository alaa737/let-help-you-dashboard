import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const EXPENSE_CATEGORIES = ['إيجار', 'كهرباء', 'صيانة', 'طعام', 'مواصلات', 'أخرى'];

const Expenses = () => {
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray());
  const [formData, setFormData] = useState({ category: EXPENSE_CATEGORIES[0], amount: 0, description: '' });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.expenses.add({ ...formData, date: new Date() });
      await db.treasuryLogs.add({
        type: 'out',
        amount: formData.amount,
        reason: `مصاريف: ${formData.category} - ${formData.description}`,
        date: new Date()
      });
      toast.success('تم تسجيل المصروف بنجاح');
      setFormData({ category: EXPENSE_CATEGORIES[0], amount: 0, description: '' });
    } catch (error) {
      toast.error('خطأ في التسجيل');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gold">المصاريف</h1>
        <p className="text-muted-foreground">إدارة النفقات والمصاريف الإدارية</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="luxury-card p-6 h-fit">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold" /> تسجيل مصروف جديد
          </h2>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="text-xs mb-1 block">الفئة</label>
              <select 
                className="input-luxury"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block">المبلغ</label>
              <input 
                type="number" 
                required 
                className="input-luxury" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block">الوصف</label>
              <textarea 
                className="input-luxury h-24" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full btn-primary">حفظ</button>
          </form>
        </div>

        <div className="md:col-span-2 luxury-card overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/5 text-xs">
              <tr>
                <th className="p-4">التاريخ</th>
                <th className="p-4">الفئة</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">الوصف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {expenses?.map(ex => (
                <tr key={ex.id} className="hover:bg-white/5">
                  <td className="p-4 text-xs text-muted-foreground">{new Date(ex.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-lg bg-white/10 text-xs">{ex.category}</span></td>
                  <td className="p-4 font-bold text-destructive">{ex.amount} ج</td>
                  <td className="p-4 text-sm text-muted-foreground">{ex.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;