export type Category = {
  id: string;
  name: string;
  createdAt: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  createdAt: number;
};

export type Settings = {
  storeName: string;
  whatsappNumber: string;
  logo: string | null;
};

const KEYS = {
  categories: "store:categories",
  products: "store:products",
  orders: "store:orders",
  settings: "store:settings",
  session: "store:session",
};

const DEFAULT_SETTINGS: Settings = {
  storeName: "متجري",
  whatsappNumber: "0556285956",
  logo: null,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export class StorageQuotaError extends Error {
  constructor() {
    super("STORAGE_QUOTA_EXCEEDED");
    this.name = "StorageQuotaError";
  }
}

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const name = err.name || "";
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /quota/i.test(err.message)
  );
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (isQuotaError(err)) {
      throw new StorageQuotaError();
    }
    throw err;
  }
  window.dispatchEvent(new CustomEvent("store-change", { detail: { key } }));
}

export const storage = {
  // Categories
  getCategories(): Category[] {
    return read<Category[]>(KEYS.categories, []);
  },
  saveCategories(items: Category[]): void {
    write(KEYS.categories, items);
  },
  addCategory(name: string): Category {
    const items = storage.getCategories();
    const newCat: Category = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    };
    items.push(newCat);
    storage.saveCategories(items);
    return newCat;
  },
  updateCategory(id: string, patch: Partial<Category>): void {
    const items = storage.getCategories().map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    );
    storage.saveCategories(items);
  },
  deleteCategory(id: string): void {
    const items = storage.getCategories().filter((c) => c.id !== id);
    storage.saveCategories(items);
    // Unassign category from products
    const products = storage.getProducts().map((p) =>
      p.categoryId === id ? { ...p, categoryId: undefined } : p,
    );
    storage.saveProducts(products);
  },

  // Products
  getProducts(): Product[] {
    return read<Product[]>(KEYS.products, []);
  },
  saveProducts(items: Product[]): void {
    write(KEYS.products, items);
  },
  getProduct(id: string): Product | undefined {
    return storage.getProducts().find((p) => p.id === id);
  },
  addProduct(input: Omit<Product, "id" | "createdAt">): Product {
    const items = storage.getProducts();
    const newProduct: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    items.unshift(newProduct);
    storage.saveProducts(items);
    return newProduct;
  },
  updateProduct(id: string, patch: Partial<Product>): void {
    const items = storage.getProducts().map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
    storage.saveProducts(items);
  },
  deleteProduct(id: string): void {
    const items = storage.getProducts().filter((p) => p.id !== id);
    storage.saveProducts(items);
  },

  // Orders
  getOrders(): Order[] {
    return read<Order[]>(KEYS.orders, []);
  },
  saveOrders(items: Order[]): void {
    write(KEYS.orders, items);
  },
  addOrder(input: Omit<Order, "id" | "createdAt">): Order {
    const items = storage.getOrders();
    const newOrder: Order = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    items.unshift(newOrder);
    try {
      storage.saveOrders(items);
    } catch (err) {
      if (err instanceof StorageQuotaError) {
        // Self-heal: strip heavy image data from existing orders and retry.
        const slimmed = items.map((o) => ({
          ...o,
          items: o.items.map(({ image: _omit, ...rest }) => rest),
        }));
        try {
          storage.saveOrders(slimmed);
        } catch {
          // Last resort: keep only the latest 20 orders.
          storage.saveOrders(slimmed.slice(0, 20));
        }
      } else {
        throw err;
      }
    }
    return newOrder;
  },
  deleteOrder(id: string): void {
    const items = storage.getOrders().filter((o) => o.id !== id);
    storage.saveOrders(items);
  },

  // Settings
  getSettings(): Settings {
    return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) };
  },
  saveSettings(patch: Partial<Settings>): void {
    const next = { ...storage.getSettings(), ...patch };
    write(KEYS.settings, next);
  },

  // Session
  isAdmin(): boolean {
    return read<boolean>(KEYS.session, false);
  },
  signIn(username: string, password: string): boolean {
    if (username === "admin" && password === "admin111") {
      write(KEYS.session, true);
      return true;
    }
    return false;
  },
  signOut(): void {
    write(KEYS.session, false);
  },
};

export function useStorageVersion(): number {
  // Hook signature for React components — actual hook in use-storage.ts
  return 0;
}
