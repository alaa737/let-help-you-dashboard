import Dexie, { type EntityTable } from 'dexie';

interface Product {
  id?: number;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockLimit: number;
}

interface Sale {
  id?: number;
  items: { productId: number; name: string; quantity: number; price: number }[];
  total: number;
  discount: number;
  finalTotal: number;
  paymentMethod: 'Cash' | 'Vodafone Cash' | 'InstaPay';
  employeeName: string;
  date: Date;
}

interface Purchase {
  id?: number;
  supplier: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  date: Date;
}

interface Expense {
  id?: number;
  category: string;
  amount: number;
  description: string;
  date: Date;
}

interface Debt {
  id?: number;
  customerName: string;
  phone: string;
  products: string;
  total: number;
  paid: number;
  remaining: number;
  date: Date;
}

interface TreasuryLog {
  id?: number;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  date: Date;
}

class LOLStationDB extends Dexie {
  products!: EntityTable<Product, 'id'>;
  sales!: EntityTable<Sale, 'id'>;
  purchases!: EntityTable<Purchase, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  debts!: EntityTable<Debt, 'id'>;
  treasuryLogs!: EntityTable<TreasuryLog, 'id'>;

  constructor() {
    super('LOLStationDB');
    this.version(1).stores({
      products: '++id, name, category',
      sales: '++id, employeeName, date',
      purchases: '++id, supplier, productName, date',
      expenses: '++id, category, date',
      debts: '++id, customerName, phone',
      treasuryLogs: '++id, type, date'
    });
  }
}

export const db = new LOLStationDB();