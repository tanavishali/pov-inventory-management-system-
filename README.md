# 🛒 Smart Sales App (WholesalePro POS System)

A powerful, multi-tenant Point of Sale (POS) and inventory management system built with the MERN stack (MongoDB, Express, React, Node.js). 

This platform is designed to handle multiple shop businesses from a single Super Admin control panel, allowing platform owners to monitor licenses, manage subscriptions, and oversee wholesale operations seamlessly.

## ✨ Key Features

### 🛡️ Super Admin Master Control
- **Tenant Management**: Create, edit, and monitor individual shop accounts.
- **Subscription Tracking**: Track monthly fees, mark accounts as Paid, Unpaid, or Overdue.
- **Access Control**: Instantly block access or grant "Demo" access to shops with custom expiry dates.
- **Platform Analytics**: Global view of total licenses sold, active logins, and monthly recurring revenue.

### 🏪 Shop Owner Dashboard
- **Product Management**: Track inventory, set pricing, and manage stock levels.
- **Udhar (Credit) Khata**: Dedicated system to manage customer debts, partial payments, and credit history.
- **Salesman Accounts**: Multi-role access allowing shop owners to create restricted logins for their employees.
- **Order Processing & Invoices**: Generate professional invoices and track daily sales history.

## 🚀 Tech Stack
- **Frontend**: React (Vite), React Router v6, Redux Toolkit (RTK Query), Vanilla CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/smart-sales-app.git
   cd smart-sales-app
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your PORT, MONGO_URI, and JWT_SECRET
   npm run start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔒 Default Access Roles
- **Super Admin**: Has global system access. Controls shop access to the software.
- **Shop Admin**: The owner of the individual shop. Can manage inventory, billing, and salesmen.
- **Salesman**: An employee of the shop with restricted access (e.g., only billing and basic stock views).

## 💡 Architecture Highlights
- **Detached Routing**: The Super Admin ecosystem and Shop Dashboard are completely isolated via mutually exclusive React Router paths to ensure maximum security.
- **Dynamic Persisted State**: Automatic caching and API synchronization using RTK Query.

---
*Built with ❤️ for modern wholesale and retail businesses.*
