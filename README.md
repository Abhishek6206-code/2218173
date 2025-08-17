# MERN E-Commerce Full Stack Application

This is a complete MERN (MongoDB, Express.js, React, Node.js) stack e-commerce application built following the exact patterns from the reference repositories.

## Features

- **User Authentication**: Register, login, logout with JWT tokens
- **Product Management**: View products, filter by category and price
- **Shopping Cart**: Add/remove items, adjust quantities
- **Order Management**: Checkout process with address management
- **Payment Integration**: Razorpay payment gateway integration
- **Responsive Design**: Bootstrap-based UI with modern styling

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Razorpay** for payment processing
- **CORS** for cross-origin requests

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Context API** for state management
- **Axios** for HTTP requests
- **React Toastify** for notifications
- **Bootstrap 5** for styling

## Project Structure

```
MERN-E-Commerce/
├── backend/
│   ├── Models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Address.js
│   │   └── Payment.js
│   ├── Controllers/
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── address.js
│   │   └── payment.js
│   ├── Routes/
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── address.js
│   │   └── payment.js
│   ├── Middlewares/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── product/
│   │   │   ├── user/
│   │   │   └── [other components]
│   │   ├── context/
│   │   │   ├── AppContext.jsx
│   │   │   └── AppState.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Update the MongoDB connection string in `server.js` or create a `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=1000
```

4. Add sample data to the database:
```bash
node addSampleData.js
```

5. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:1000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### User Routes (`/api/user`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `GET /all` - Get all users

### Product Routes (`/api/product`)
- `GET /all` - Get all products
- `GET /:id` - Get product by ID
- `POST /add` - Add new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product

### Cart Routes (`/api/cart`)
- `POST /add` - Add item to cart (protected)
- `GET /user` - Get user cart (protected)
- `DELETE /remove/:productId` - Remove item from cart (protected)
- `DELETE /clear` - Clear cart (protected)
- `POST /--qty` - Decrease item quantity (protected)

### Address Routes (`/api/address`)
- `POST /add` - Add shipping address (protected)
- `GET /get` - Get user address (protected)

### Payment Routes (`/api/payment`)
- `POST /checkout` - Create payment order
- `POST /verify-payment` - Verify payment
- `GET /userorder` - Get user orders (protected)
- `GET /orders` - Get all orders

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=1000
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Products**: View all products or filter by category/price
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Manage Cart**: View cart, adjust quantities, remove items
5. **Checkout**: Add shipping address and proceed to payment
6. **Payment**: Complete purchase using Razorpay integration

## Features Implementation Status

✅ **Completed:**
- Backend API with all models, controllers, and routes
- User authentication (register, login, JWT)
- Product management (CRUD operations)
- Shopping cart functionality
- Frontend React application with routing
- State management with Context API
- Basic UI components (Navbar, Product display, User forms)
- MongoDB integration with sample data

🔄 **In Progress/To Complete:**
- Complete all frontend components (Cart, Checkout, Profile, etc.)
- Razorpay payment integration
- Order management system
- Search functionality
- Product detail pages
- Admin panel for product management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built following the patterns from the reference repositories
- Uses modern MERN stack best practices
- Implements secure authentication and payment processing




