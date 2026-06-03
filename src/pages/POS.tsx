import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { Search, ShoppingCart, Trash2, Minus, Plus, CreditCard, Banknote, Smartphone, Printer, ShieldAlert } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

const POS = () => {
  const { user } = useAuth();
  const products = useLiveQuery(() => db.products.toArray());
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Vodafone Cash' | 'InstaPay'>('Cash');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && p.quantity > 0
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error('الكمية المتاحة لا تكفي');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.sellingPrice, quantity: 1, maxQuantity: product.quantity }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.maxQuantity) {
          toast.error('الكمية المتاحة لا تكفي');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountValue = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const finalTotal = subtotal - discountValue;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const discountPercent = discountType === 'percentage' ? discount : (discount / subtotal * 100);
    if (discountPercent > 10 && user?.role !== 'admin' && !showAdminPin) {
      setShowAdminPin(true);
      return;
    }

    if (showAdminPin && adminPin !== 'LOL2026') {
      toast.error('كلمة مرور المدير خاطئة');
      return;
    }

    try {
      const sale = {
        items: cart.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity, price: item.price })),
        total: subtotal,
        discount: discountValue,
        finalTotal: finalTotal,
        paymentMethod,
        employeeName: user?.name || 'غير معروف',
        date: new Date()
      };

      const saleId = await db.sales.add(sale);
      
      for (const item of cart) {
        const product = await db.products.get(item.id);
        if (product) {
          await db.products.update(item.id, { quantity: product.quantity - item.quantity });
        }
      }

      await db.treasuryLogs.add({
        type: 'in',
        amount: finalTotal,
        reason: `مبيعات فاتورة رقم #${saleId}`,
        date: new Date()
      });

      setLastSale({ ...sale, id: saleId });
      setCart([]);
      setDiscount(0);
      setShowAdminPin(false);
      setAdminPin('');
      setShowReceipt(true);
      toast.success('تمت عملية البيع بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء إتمام العملية');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن منتج بالاسم..."
            className="input-luxury pr-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
          {filteredProducts?.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="luxury-card p-4 text-right hover:border-gold/50 transition-colors group relative"
            >
              <span className="absolute top-2 left-2 text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full">
                {product.quantity} متاح
              </span>
              <p className="font-bold text-sm mb-1 group-hover:text-gold transition-colors">{product.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
              <p className="text-gold font-bold">{product.sellingPrice} جنيه</p>
            </button>
          ))}
        </div>
      </div>

      <div className="luxury-card flex flex-col h-full bg-matte border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gold" />
          <h2 className="font-bold">سلة المبيعات</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{item.name}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded bg-white/10"><Minus className="w-4 h-4" /></button>
                  <span className="font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded bg-white/10"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-gold font-bold">{item.price * item.quantity} ج</span>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2">
              <ShoppingCart className="w-12 h-12" />
              <p>السلة فارغة</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نوع الخصم</label>
              <select 
                className="input-luxury py-1 text-sm h-10"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
              >
                <option value="amount">قيمة (ج)</option>
                <option value="percentage">نسبة (%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الخصم</label>
              <input
                type="number"
                className="input-luxury py-1 text-sm h-10"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الإجمالي:</span>
              <span>{subtotal} ج</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الخصم:</span>
              <span className="text-destructive">-{discountValue} ج</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
              <span className="text-gold">المجموع النهائي:</span>
              <span className="text-gold">{finalTotal} ج</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`flex-1 p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${paymentMethod === 'Cash' ? 'border-gold bg-gold/10' : 'border-white/10'}`}
            >
              <Banknote className="w-4 h-4" />
              <span className="text-[10px]">كاش</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('Vodafone Cash')}
              className={`flex-1 p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${paymentMethod === 'Vodafone Cash' ? 'border-gold bg-gold/10' : 'border-white/10'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px]">فودافون</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('InstaPay')}
              className={`flex-1 p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${paymentMethod === 'InstaPay' ? 'border-gold bg-gold/10' : 'border-white/10'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px]">إنستا باي</span>
            </button>
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full btn-primary h-12">
            تأكيد البيع
          </button>
        </div>
      </div>

      {showAdminPin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="luxury-card p-6 w-full max-w-sm space-y-4 border-gold">
            <div className="flex items-center gap-2 text-gold">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold">موافقة المدير</h2>
            </div>
            <p className="text-sm text-muted-foreground">الخصم يتجاوز 10%. يرجى إدخال كلمة مرور المدير للمتابعة.</p>
            <input
              type="password"
              className="input-luxury text-center tracking-[1em]"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="••••"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleCheckout} className="flex-1 btn-primary">تأكيد</button>
              <button onClick={() => { setShowAdminPin(false); setAdminPin(''); }} className="flex-1 bg-zinc-800 rounded-lg">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black p-8 w-full max-w-sm rounded shadow-2xl relative font-mono text-xs">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase tracking-wider">LOL STATION</h1>
              <p>نظام إدارة مبيعات الفيب</p>
              <div className="border-b border-black border-dashed my-2" />
              <p>رقم الفاتورة: #{lastSale.id}</p>
              <p>{new Date(lastSale.date).toLocaleString('ar-EG')}</p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between font-bold border-b border-black pb-1">
                <span>المنتج</span>
                <div className="flex gap-4">
                  <span>كم</span>
                  <span>السعر</span>
                </div>
              </div>
              {lastSale.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{item.name}</span>
                  <div className="flex gap-4">
                    <span>{item.quantity}</span>
                    <span>{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-t border-black pt-2">
              <div className="flex justify-between">
                <span>الإجمالي:</span>
                <span>{lastSale.total} ج</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span>-{lastSale.discount} ج</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-black pt-1">
                <span>الصافي:</span>
                <span>{lastSale.finalTotal} ج</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p>طريقة الدفع: {lastSale.paymentMethod}</p>
              <p>الموظف: {lastSale.employeeName}</p>
              <div className="border-b border-black border-dashed my-4" />
              <p className="font-bold">شكراً لزيارتكم!</p>
            </div>

            <button 
              onClick={() => setShowReceipt(false)} 
              className="absolute -top-12 left-0 right-0 bg-gold text-black font-bold py-2 rounded flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> إغلاق وطباعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;