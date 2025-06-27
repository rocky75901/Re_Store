# 🛍️ Re_Store

**Re_Store** is a full-stack MERN web application designed for IIT Kanpur’s campus community to **buy, sell, and auction** second-hand products. The platform offers a secure, feature-rich, and intuitive experience tailored for students, faculty, and staff, enabling smooth local transactions backed by real-time communication and auction management.

---

## 🚀 Features

- 🔐 **Secure Authentication**: JWT-based login and password recovery
- 🛒 **Product Listings**: Sell items directly or list them for auction
- 📦 **Auction System**: Real-time bidding with live updates and countdown
- 💬 **Messaging**: One-to-one user chats powered by **Socket.IO**
- 🎯 **Smart Filters**: Search by category, price range, and item condition
- ❤️ **Favorites**: Save products for easy future access
- 🧾 **Order & Cart System**: Checkout flow with order tracking
- 👤 **Profile Management**: Update details, view listings and history
- 🛠️ **Admin Dashboard**: Manage users, listings, and reports

---

## 🧱 Tech Stack

### Frontend
- **React.js**, **HTML5**, **CSS3**
- **Socket.IO** (real-time chat and auction updates)

### Backend
- **Node.js**, **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** & **bcrypt** for authentication

---

## 📁 Project Structure

  - React frontend
  - Express backend
  - Mongoose schemas
  - API endpoints
  - Business logic
  - Real-time handlers (Socket.IO)


---

## 👥 User Roles

### 👤 Regular Users
- Browse, buy, sell, and bid on products
- Chat with sellers or buyers
- Manage cart, profile, and order history

### 🛠️ Admins
- Monitor listings and user activity
- Resolve reports and flag inappropriate items
- Manage system-wide data integrity

---

## 🛠️ Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/your-org/re_store.git
cd re_store

# 2. Backend setup
cd server
npm install

# 3. Frontend setup
cd ../client
npm install

# 4. Run the project (adjust as needed)
# You can use concurrently to run both
cd ..
npm run dev
