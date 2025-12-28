import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Correct URL with your IP address
const API_BASE_URL = 'http://192.168.10.14:3000/api';

console.log('🔗 Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
});

// Enhanced mock data as fallback
const enhancedMockProducts = [
  {
    id: 1,
    name: 'iPhone 14 Pro',
    description: 'Latest Apple smartphone with advanced camera and A16 Bionic chip',
    price: 999.99,
    image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    category: 'electronics',
    stock: 50,
    rating: 4.5,
    reviews: 1250
  },
  {
    id: 2,
    name: 'Samsung Galaxy S23',
    description: 'Powerful Android smartphone with amazing display and camera',
    price: 849.99,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    category: 'electronics',
    stock: 30,
    rating: 4.3,
    reviews: 890
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    description: 'Apple laptop for professionals with M2 chip and Retina display',
    price: 2399.99,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    category: 'electronics',
    stock: 20,
    rating: 4.8,
    reviews: 670
  },
  {
    id: 4,
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with air cushioning technology',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: 'fashion',
    stock: 100,
    rating: 4.2,
    reviews: 450
  },
  {
    id: 5,
    name: 'Sony WH-1000XM4',
    description: 'Wireless noise-canceling headphones with premium sound quality',
    price: 349.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'electronics',
    stock: 40,
    rating: 4.6,
    reviews: 1200
  },
  {
    id: 6,
    name: 'Designer Watch',
    description: 'Luxury wrist watch with leather strap and premium finish',
    price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
    category: 'accessories',
    stock: 25,
    rating: 4.4,
    reviews: 320
  }
];

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Smart API calls with better fallback
export const productAPI = {
  getAllProducts: async () => {
    try {
      console.log('🔄 Fetching products from backend...');
      const response = await api.get('/products');
      console.log('✅ Successfully fetched', response.data.length, 'products from backend');
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using enhanced mock data');
      return enhancedMockProducts;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock product data');
      return enhancedMockProducts.find(p => p.id === parseInt(id)) || enhancedMockProducts[0];
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.log('Using mock categories');
      return ['All', 'electronics', 'fashion', 'accessories', 'home'];
    }
  },

  getProductsByCategory: async (category) => {
    try {
      const allProducts = await productAPI.getAllProducts();
      if (category === 'All') return allProducts;
      return allProducts.filter(product => 
        product.category?.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.log('Using category filter on mock data');
      const allProducts = enhancedMockProducts;
      if (category === 'All') return allProducts;
      return allProducts.filter(product => 
        product.category?.toLowerCase() === category.toLowerCase()
      );
    }
  }
};

export const cartAPI = {
  getCartItems: async () => {
    try {
      console.log('🔄 Fetching cart from backend...');
      const response = await api.get('/cart');
      console.log('✅ Got', response.data.length, 'cart items from backend');
      return response.data;
    } catch (error) {
      console.log('❌ Using local cart storage');
      try {
        const cartItems = await AsyncStorage.getItem('cartItems');
        return cartItems ? JSON.parse(cartItems) : [];
      } catch (localError) {
        return [];
      }
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      console.log('🛒 Adding to cart via backend...');
      const response = await api.post('/cart', { productId, quantity });
      return response.data;
    } catch (error) {
      console.log('❌ Using local cart storage');
      try {
        const product = await productAPI.getProductById(productId);
        const cartItems = await cartAPI.getCartItems();
        const existingItem = cartItems.find(item => item.product_id === parseInt(productId));

        let updatedCart;
        if (existingItem) {
          updatedCart = cartItems.map(item =>
            item.product_id === parseInt(productId)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedCart = [
            ...cartItems,
            {
              id: Date.now(),
              product_id: parseInt(productId),
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              category: product.category,
              quantity: quantity
            }
          ];
        }

        await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
        return { success: true, message: 'Product added to cart successfully!' };
      } catch (fallbackError) {
        throw new Error('Failed to add to cart');
      }
    }
  },

  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await api.put(`/cart/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      console.log('❌ Using local cart storage');
      try {
        const cartItems = await cartAPI.getCartItems();
        const updatedCart = cartItems.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
        return { success: true, message: 'Cart updated successfully' };
      } catch (fallbackError) {
        throw new Error('Failed to update cart');
      }
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      const response = await api.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.log('❌ Using local cart storage');
      try {
        const cartItems = await cartAPI.getCartItems();
        const updatedCart = cartItems.filter(item => item.id !== cartItemId);
        await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
        return { success: true, message: 'Item removed from cart' };
      } catch (fallbackError) {
        throw new Error('Failed to remove from cart');
      }
    }
  },

  clearCart: async () => {
    try {
      // Try backend first
      try {
        const response = await api.delete('/cart');
        return response.data;
      } catch (backendError) {
        // Fallback to local storage
        await AsyncStorage.removeItem('cartItems');
        return { success: true, message: 'Cart cleared successfully' };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }
};

export const authAPI = {
  signup: async (userData) => {
    try {
      console.log('👤 Signing up via backend...');
      const response = await api.post('/auth/signup', userData);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.log('❌ Using mock signup');
      // Mock successful signup
      const mockUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        address: userData.address,
        phone: userData.phone
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('token', 'mock-token');
      return { success: true, message: 'User created successfully', user: mockUser };
    }
  },

  login: async (credentials) => {
    try {
      console.log('🔐 Logging in via backend...');
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.log('❌ Using mock login');
      // Mock successful login
      const mockUser = {
        id: 1,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        address: '123 Main Street',
        phone: '+1234567890'
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('token', 'mock-token');
      return { success: true, message: 'Login successful', user: mockUser };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

export const orderAPI = {
  createOrder: async (orderData) => {
    try {
      console.log('📦 Creating order via backend...');
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.log('❌ Using local order storage');
      try {
        const orders = await orderAPI.getUserOrders();
        const newOrder = {
          id: Date.now(),
          ...orderData,
          status: 'confirmed',
          order_date: new Date().toISOString(),
          estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const updatedOrders = [newOrder, ...orders];
        await AsyncStorage.setItem('userOrders', JSON.stringify(updatedOrders));
        
        await cartAPI.clearCart();
        
        return { 
          success: true, 
          message: 'Order created successfully!',
          orderId: newOrder.id
        };
      } catch (fallbackError) {
        throw new Error('Failed to create order');
      }
    }
  },

  getUserOrders: async () => {
    try {
      console.log('📋 Fetching orders from backend...');
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.log('❌ Using local order storage');
      try {
        const orders = await AsyncStorage.getItem('userOrders');
        return orders ? JSON.parse(orders) : [];
      } catch (localError) {
        return [];
      }
    }
  }
};

export default api;