YOUTUBE LINK: (https://youtube.com/shorts/4Gu_5ezFvY8?feature=share)




📱 E-Commerce Mobile App - A2 Project
A complete full-stack E-Commerce application built with React Native Expo frontend and Express.js backend with MySQL database.

🎯 Project Overview
This is a fully functional online shopping app with user authentication, product browsing, cart management, and order processing capabilities.

🚀 Technology Stack
Frontend
React Native with Expo

React Navigation (Stack + Bottom Tabs)

Context API for State Management

Axios for API calls

AsyncStorage for local storage

Ionicons for UI icons

Backend
Node.js with Express.js

MySQL database with XAMPP

JWT for authentication

bcryptjs for password hashing

CORS enabled

Database
MySQL with XAMPP

Tables: users, products, cart, orders, order_items

📁 Project Structure
text
ecommerce-app/
├── frontend/
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   ├── ProductContext.js
│   │   └── WishlistContext.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── CategoriesScreen.js
│   │   ├── CartScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── ProductDetailsScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── CheckoutScreen.js
│   │   └── OrderConfirmationScreen.js
│   ├── services/
│   │   └── api.js
│   └── App.js
├── backend/
│   ├── server.js
│   └── package.json
└── README.md
🛠 Installation & Setup
Prerequisites
Node.js installed

XAMPP installed

Expo Go app on mobile

Backend Setup
Start Database:

bash
# Start XAMPP Control Panel
# Start Apache and MySQL
Create Database:

sql
CREATE DATABASE ecommerce;
USE ecommerce;
Run Backend:

bash
cd backend
npm install
npm start
Server runs on http://localhost:3000

Frontend Setup
Install Dependencies:

bash
cd frontend
npm install
Configure API URL:

Open services/api.js

Update API_BASE_URL with your IP:

javascript
const API_BASE_URL = 'http://YOUR_IP:3000/api';
Run Frontend:

bash
npx expo start
Scan QR code with Expo Go app

📊 Database Schema
Users Table
sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  address TEXT,
  phone VARCHAR(20)
);
Products Table
sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock INT
);
Cart Table
sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  product_id INT,
  quantity INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
Orders Table
sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  total_amount DECIMAL(10,2),
  status VARCHAR(50),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
Order Items Table
sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
📱 App Features
🔐 Authentication
User Signup/Login

Guest mode support

JWT token-based authentication

Secure password hashing

🏠 Home Screen
Product grid layout

Search functionality

Category filtering

Price sorting

Add to cart directly

🛍️ Product Management
Product details with images

Quantity selection

Product ratings and reviews

Share functionality

🛒 Cart System
Add/remove items

Quantity updates

Price calculations

Delivery charges

Cart persistence

💳 Checkout Process
Shipping information

Multiple payment methods

Order summary

Order confirmation

👤 User Profile
Personal information

Order history

Profile editing

Logout functionality

🔄 API Endpoints
Authentication
POST /api/auth/signup - User registration

POST /api/auth/login - User login

Products
GET /api/products - Get all products

GET /api/products/:id - Get product by ID

GET /api/categories - Get all categories

Cart
GET /api/cart - Get user cart

POST /api/cart - Add to cart

PUT /api/cart/:id - Update cart item

DELETE /api/cart/:id - Remove from cart

Orders
POST /api/orders - Create order

GET /api/orders - Get user orders

🎨 UI/UX Features
Responsive Design - Works on all screen sizes

Bottom Tab Navigation - Easy screen switching

Loading States - Better user experience

Error Handling - User-friendly error messages

Smooth Animations - Enhanced user interaction

🤝 Contributing
Fork the project

Create your feature branch

Commit your changes

Push to the branch

Open a Pull Request

📄 License
This project is created for educational purposes as part of Assignment 2.

👨‍💻 Developer
HAseeb Ali....7228

Course: Mobile Application Development

Assignment: A2 - E-Commerce App

