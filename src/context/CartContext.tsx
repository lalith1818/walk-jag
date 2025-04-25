import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: number) => void;
  removeFromCart: (id: number, size: number, name: string) => void;
  updateQuantity: (id: number, size: number, name: string, quantity: number) => void;
  clearCart: () => void;  // ✅ New function to clear cart
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // ✅ Sync cart with localStorage on every update
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // ✅ Add product ensuring unique identification
  const addToCart = (product: Product, size: number) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.id === product.id && item.selectedSize === size && item.name === product.name
      );

      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size && item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  // ✅ Remove product by id, size, and name
  const removeFromCart = (id: number, size: number, name: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.name === name)));
  };

  // ✅ Update quantity
  const updateQuantity = (id: number, size: number, name: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.selectedSize === size && item.name === name
          ? { ...item, quantity: Math.max(1, quantity) } // Ensures quantity doesn't go below 1
          : item
      )
    );
  };

  // ✅ Clear cart (Used when user logs out)
  const clearCart = () => {
    setItems([]);  
    localStorage.removeItem('cart');  // ✅ Remove cart from localStorage
  };

  // ✅ Calculate total price
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
