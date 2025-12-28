const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';

// ✅ Enhanced CORS with your IP
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:19006', 
    'http://10.0.2.2:3001',
    'http://192.168.10.14:19006', // ✅ Your IP for Expo
    'http://192.168.10.14:3001',
    'exp://192.168.10.14:19000' // Expo development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecommerce'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database as id ' + connection.threadId);
});

// ✅ Middleware
app.use(express.json());

// ✅ Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'E-commerce backend is running',
    timestamp: new Date().toISOString()
  });
});

// 🧍 Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Check if user exists
    connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query(
          'INSERT INTO users (name, email, password, address, phone) VALUES (?, ?, ?, ?, ?)',
          [name, email, hashedPassword, address, phone],
          (error, results) => {
            if (error) {
              console.error('Error creating user:', error);
              return res.status(500).json({ error: 'Failed to create user' });
            }

            const token = jwt.sign(
              { userId: results.insertId, email: email },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.status(201).json({
              success: true,
              message: 'User created successfully',
              token,
              user: { 
                id: results.insertId, 
                name, 
                email, 
                address, 
                phone 
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🛍️ Product Routes
app.get('/api/products', (req, res) => {
  connection.query('SELECT * FROM products', (error, results) => {
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(results);
  });
});

app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  connection.query('SELECT * FROM products WHERE id = ?', [productId], (error, results) => {
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(results[0]);
  });
});

app.get('/api/categories', (req, res) => {
  connection.query('SELECT DISTINCT category FROM products', (error, results) => {
    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    const categories = results.map(row => row.category);
    res.json(['All', ...categories]);
  });
});

// 🛒 CART ROUTES
// Get Cart
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  connection.query(
    `SELECT c.*, p.name, p.price, p.image_url, p.category 
     FROM cart c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.user_id = ?`,
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({ error: 'Failed to fetch cart' });
      }
      res.json(results);
    }
  );
});

// Add to Cart
app.post('/api/cart', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    connection.query('SELECT * FROM products WHERE id = ?', [productId], (error, productResults) => {
      if (error || productResults.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      connection.query(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId],
        (error, cartResults) => {
          if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
          }

          if (cartResults.length > 0) {
            const newQuantity = cartResults[0].quantity + quantity;
            connection.query(
              'UPDATE cart SET quantity = ? WHERE id = ?',
              [newQuantity, cartResults[0].id],
              (error) => {
                if (error) {
                  console.error('Error updating cart:', error);
                  return res.status(500).json({ error: 'Failed to update cart' });
                }
                res.json({ success: true, message: 'Cart updated successfully' });
              }
            );
          } else {
            connection.query(
              'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
              [userId, productId, quantity],
              (error) => {
                if (error) {
                  console.error('Error adding to cart:', error);
                  return res.status(500).json({ error: 'Failed to add to cart' });
                }
                res.json({ success: true, message: 'Product added to cart successfully!' });
              }
            );
          }
        }
      );
    });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const cartItemId = req.params.id;
  const userId = req.user.userId;

  connection.query(
    'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, cartItemId, userId],
    (error, results) => {
      if (error) {
        console.error('Error updating cart:', error);
        return res.status(500).json({ error: 'Failed to update cart' });
      }
      res.json({ success: true, message: 'Cart updated successfully' });
    }
  );
});

// Remove item from cart
app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  const cartItemId = req.params.id;
  const userId = req.user.userId;

  connection.query(
    'DELETE FROM cart WHERE id = ? AND user_id = ?',
    [cartItemId, userId],
    (error, results) => {
      if (error) {
        console.error('Error removing from cart:', error);
        return res.status(500).json({ error: 'Failed to remove from cart' });
      }
      res.json({ success: true, message: 'Item removed from cart' });
    }
  );
});

// Clear all items in cart
app.delete('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  connection.query(
    'DELETE FROM cart WHERE user_id = ?',
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error clearing cart:', error);
        return res.status(500).json({ error: 'Failed to clear cart' });
      }
      res.json({ success: true, message: 'Cart cleared successfully' });
    }
  );
});

// 📦 ORDER ROUTES
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).json({ error: 'Failed to create order' });
      }

      // Create order
      connection.query(
        'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
        [userId, totalAmount, shippingAddress, paymentMethod],
        (error, orderResults) => {
          if (error) {
            return connection.rollback(() => {
              console.error('Error creating order:', error);
              res.status(500).json({ error: 'Failed to create order' });
            });
          }

          const orderId = orderResults.insertId;

          // Add order items
          const orderItems = items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price
          ]);

          connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [orderItems],
            (error) => {
              if (error) {
                return connection.rollback(() => {
                  console.error('Error adding order items:', error);
                  res.status(500).json({ error: 'Failed to create order items' });
                });
              }

              // Clear cart
              connection.query(
                'DELETE FROM cart WHERE user_id = ?',
                [userId],
                (error) => {
                  if (error) {
                    return connection.rollback(() => {
                      console.error('Error clearing cart:', error);
                      res.status(500).json({ error: 'Failed to clear cart' });
                    });
                  }

                  // Commit transaction
                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        console.error('Commit error:', err);
                        res.status(500).json({ error: 'Failed to commit order' });
                      });
                    }

                    res.json({
                      success: true,
                      message: 'Order created successfully!',
                      orderId: orderId
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  connection.query(
    `SELECT o.*, 
            COUNT(oi.id) as item_count
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.order_date DESC`,
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }
      res.json(results);
    }
  );
});

// 🚀 Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏪 Backend running at http://localhost:${PORT}`);
  console.log(`🌐 Access via network: http://192.168.10.14:${PORT}`);
});