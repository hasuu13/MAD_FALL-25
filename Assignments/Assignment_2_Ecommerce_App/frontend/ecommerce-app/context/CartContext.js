import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching cart items...');
      const items = await cartAPI.getCartItems();
      setCartItems(items);
      console.log(`✅ Got ${items.length} cart items`);
    } catch (err) {
      setError(err.message);
      console.error('Error loading cart items:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setError(null);
      console.log('🛒 Adding to cart:', { productId, quantity });
      await cartAPI.addToCart(productId, quantity);
      await loadCartItems(); // Reload cart items
      console.log('✅ Add to cart success');
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error adding to cart:', err);
      return false;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      setError(null);
      await cartAPI.removeFromCart(cartItemId);
      await loadCartItems(); // Reload cart items
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error removing from cart:', err);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setError(null);
      await cartAPI.updateCartItem(cartItemId, quantity);
      await loadCartItems(); // Reload cart items
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating quantity:', err);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await cartAPI.clearCart();
      setCartItems([]);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error clearing cart:', err);
      return false;
    }
  };

  // ✅ Cart calculations
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalItems = () => {
    return getCartItemsCount();
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCartItems,
    getCartTotal,
    getCartItemsCount,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};