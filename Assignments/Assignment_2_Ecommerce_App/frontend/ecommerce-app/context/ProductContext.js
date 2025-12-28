import React, { createContext, useState, useContext, useEffect } from 'react';
import { productAPI } from '../services/api'; // ✅ Correct import

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await productAPI.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await productAPI.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id) => {
    try {
      return await productAPI.getProductById(id);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching product:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const value = {
    products,
    categories,
    loading,
    error,
    loadProducts,
    loadCategories,
    getProductById
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};