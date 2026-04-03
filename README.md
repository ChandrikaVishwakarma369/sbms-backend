# SBMS Backend - Order Management API

## 📋 Overview
Production-ready REST API for managing orders with MongoDB, Express.js, and Node.js.

## 🚀 Features
- ✅ Full CRUD operations for orders
- ✅ Input validation middleware
- ✅ Global error handling
- ✅ Request logging
- ✅ CORS enabled
- ✅ MongoDB integration
- ✅ Health check endpoint

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Setup

Create `.env` file:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5000
NODE_ENV=development
```

## 🏃 Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/stats` | Get order statistics |
| GET | `/api/orders/:id` | Get single order by ID or orderId |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |

### Create Order
```json
POST /api/orders
{
  "customer": "John Doe",
  "contact": "03001234567",
  "product": "Laptop",
  "date": "2025-04-02",
  "address": "123 Main Street",
  "amount": 50000,
  "status": "Pending"
}
```

**Valid Statuses:** `Pending`, `Shipped`, `Delivered`, `Cancelled`

## 🛡️ Validation Rules

Required fields for POST/PUT:
- `customer` (string, non-empty)
- `contact` (string, non-empty)
- `product` (string, non-empty)
- `amount` (number, positive)
- `address` (string, non-empty)

## 📁 Project Structure

```
SBMS-Backend/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── middleware/       # Custom middlewares
├── models/          # MongoDB schemas
├── routes/          # API routes
├── .env             # Environment variables
├── server.js        # Server entry point
└── package.json
```

## 🔍 Middleware

All middleware related to the Orders module is centralized in `orderMiddleware.js` for better maintainability and scalability.

| Middleware            | Purpose                                      |
|----------------------|----------------------------------------------|
| `requestLogger`      | Logs all incoming HTTP requests              |
| `validateOrderInput` | Validates order request data                 |
| `errorHandler`       | Handles errors globally across the app       |
| `cors`               | Enables cross-origin requests (configured in server) |

## 💡 Error Handling

All errors return standardized JSON:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📊 Status Codes

- `200` - Success
- `201` - Resource created
- `400` - Bad request / Validation error
- `404` - Resource not found
- `500` - Server error

## 🧪 Testing in Postman

1. GET all orders: `http://localhost:5000/api/orders`
2. Create order: POST to `http://localhost:5000/api/orders` with JSON body
3. Update: PUT to `http://localhost:5000/api/orders/{id}`
4. Delete: DELETE to `http://localhost:5000/api/orders/{id}`

## 📝 Notes

- Orders are assigned auto-incrementing `orderId` on creation
- Update/Delete work with both MongoDB `_id` and custom `orderId`
- All dates stored as ISO strings
- Amounts must be positive numbers

## 🔐 Security

- CORS configured for specific origins
- Input validation on all order endpoints
- Error messages don't expose sensitive data
- Ready for JWT authentication integration

## 📞 Support

For issues, check:
1. MongoDB connection in `.env`
2. Server logs in console
3. Browser DevTools for API errors
4. Postman for endpoint testing

---
**Status:** ✅ Production Ready
