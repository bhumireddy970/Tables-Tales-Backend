// const express = require('express');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const bodyParser = require('body-parser');

// // Routes
// const adminRoute = require('./routes/admin');
// const customerRoute = require('./routes/customer');
// const itemRoute = require('./routes/item');
// const orderRoute = require('./routes/order');
// const chefRoute = require('./routes/chef');
// const cateringRoute = require('./routes/catering');
// const deliveryRoute = require('./routes/delivery');
// const reviewRoute = require('./routes/review');
// const branchRoutes = require('./routes/branchRoutes');
// const reservationRoutes = require('./routes/reservationRoutes');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8071;
// const MONGO_URI = process.env.MONGO_URL;

// // ✅ CORS Configuration
// const corsOptions = {
//   origin: process.env.FRONTEND_URL || '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// // ✅ Apply CORS before all routes
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Preflight handling

// // Middleware
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

// // Static file serving
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ✅ Root route - Status page
// app.get('/', (req, res) => {
//   res.send(`
//     <h1>🚀 Server is running!</h1>
//     <p>API Base URL: ${req.protocol}://${req.get('host')}</p>
//     <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
//     <p>Allowed Origin: ${process.env.FRONTEND_URL || 'All (*)'}</p>
//     <p>MongoDB URI: ${MONGO_URI ? '✅ Set' : '❌ Not Set'}</p>
//   `);
// });

// // Routes
// app.use('/customer', customerRoute);
// app.use('/admin', adminRoute);
// app.use('/item', itemRoute);
// app.use('/orders', orderRoute);
// app.use('/chef', chefRoute);
// app.use('/catering', cateringRoute);
// app.use('/deliveryboy', deliveryRoute);
// app.use('/reviews', reviewRoute);
// app.use('/api/branches', branchRoutes);
// app.use('/api/reservations', reservationRoutes);

// // ✅ Global Error Handling
// app.use((err, req, res, next) => {
//   if (err.name === 'CorsError') {
//     console.error('CORS Error:', err.message);
//     return res.status(403).json({ message: 'CORS Error: Not allowed by CORS policy' });
//   }
//   console.error('Server Error:', err);
//   res.status(500).json({ message: 'Internal server error' });
// });

// // MongoDB Connection
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected...'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

// Routes
const adminRoute = require("./routes/admin");
const customerRoute = require("./routes/customer");
const itemRoute = require("./routes/item");
const orderRoute = require("./routes/order");
const chefRoute = require("./routes/chef");
const cateringRoute = require("./routes/catering");
const deliveryRoute = require("./routes/delivery");
const reviewRoute = require("./routes/review");
const branchRoutes = require("./routes/branchRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;
const MONGO_URI = process.env.MONGO_URL;

// ✅ Enhanced CORS Configuration
const allowedOrigins = [
  "https://restaurant-app-table-tales.vercel.app",
  "http://localhost:5173",
  "http://localhost:3001",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("🚫 Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

// ✅ Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Test endpoint to verify CORS
app.get("/test-cors", (req, res) => {
  res.json({
    message: "CORS is working!",
    allowedOrigins: allowedOrigins,
    currentOrigin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restaurant API Server</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
          color: #4a5568;
          text-align: center;
          margin-bottom: 30px;
        }
        .status-card {
          background: #f7fafc;
          padding: 20px;
          border-radius: 10px;
          margin: 15px 0;
          border-left: 4px solid #4299e1;
        }
        .endpoints {
          margin-top: 30px;
        }
        .endpoint {
          background: #edf2f7;
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          border-left: 4px solid #48bb78;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-right: 10px;
        }
        .badge-success { background: #c6f6d5; color: #22543d; }
        .badge-warning { background: #feebc8; color: #744210; }
        .badge-info { background: #bee3f8; color: #1a365d; }
        a {
          color: #4299e1;
          text-decoration: none;
          font-weight: 500;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Restaurant API Server</h1>
        
        <div class="status-card">
          <h3>Server Status</h3>
          <p><strong>API Base URL:</strong> ${req.protocol}://${req.get(
    "host"
  )}</p>
          <p><strong>Environment:</strong> <span class="badge badge-info">${
            process.env.NODE_ENV || "development"
          }</span></p>
          <p><strong>Frontend URL:</strong> ${
            process.env.FRONTEND_URL || "Not set"
          }</p>
          <p><strong>MongoDB:</strong> <span class="badge ${
            MONGO_URI ? "badge-success" : "badge-warning"
          }">${MONGO_URI ? "✅ Connected" : "❌ Not Configured"}</span></p>
          <p><strong>Port:</strong> ${PORT}</p>
        </div>

        <div class="status-card">
          <h3>CORS Configuration</h3>
          <p><strong>Allowed Origins:</strong></p>
          <ul>
            ${allowedOrigins.map((origin) => `<li>${origin}</li>`).join("")}
          </ul>
          <p><a href="/test-cors">Test CORS Configuration</a></p>
        </div>

        <div class="endpoints">
          <h3>📋 Available API Endpoints</h3>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <strong>/health</strong> - Server health check
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/customer</strong> - Customer management
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/admin</strong> - Admin operations
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <span class="badge badge-info">PUT</span>
            <span class="badge badge-warning" style="background: #fed7d7; color: #742a2a;">DELETE</span>
            <strong>/item</strong> - Menu items management
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/orders</strong> - Order management
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/chef</strong> - Chef management
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/catering</strong> - Catering services
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/deliveryboy</strong> - Delivery operations
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/reviews</strong> - Customer reviews
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/api/branches</strong> - Branch management
          </div>
          
          <div class="endpoint">
            <span class="badge badge-success">GET</span>
            <span class="badge badge-warning">POST</span>
            <strong>/api/reservations</strong> - Table reservations
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p>For API documentation, please refer to the project documentation.</p>
          <p>Server started at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Your existing routes...
app.use("/customer", customerRoute);
app.use("/admin", adminRoute);
app.use("/item", itemRoute);
app.use("/orders", orderRoute);
app.use("/chef", chefRoute);
app.use("/catering", cateringRoute);
app.use("/deliveryboy", deliveryRoute);
app.use("/reviews", reviewRoute);
app.use("/api/branches", branchRoutes);
app.use("/api/reservations", reservationRoutes);

// ✅ Enhanced Error Handling
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    console.error("CORS Error:", req.headers.origin);
    return res.status(403).json({
      message: "CORS Error: Origin not allowed",
      yourOrigin: req.headers.origin,
      allowedOrigins: allowedOrigins,
      timestamp: new Date().toISOString(),
    });
  }

  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler - Enhanced
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      "/health",
      "/test-cors",
      "/customer",
      "/admin",
      "/item",
      "/orders",
      "/chef",
      "/catering",
      "/deliveryboy",
      "/reviews",
      "/api/branches",
      "/api/reservations",
    ],
    timestamp: new Date().toISOString(),
  });
});

// MongoDB Connection with enhanced error handling
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("⏳ Retrying connection in 5 seconds...");
    setTimeout(() => {
      mongoose
        .connect(MONGO_URI)
        .catch((e) => console.error("Retry failed:", e));
    }, 5000);
  });

// MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server gracefully...");
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed.");
  process.exit(0);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
✨ ========================================
   🚀 Restaurant API Server Started!
   📍 Port: ${PORT}
   🌐 Environment: ${process.env.NODE_ENV || "development"}
   🎯 CORS Enabled for: ${allowedOrigins.join(", ")}
   🗄️  MongoDB: ${MONGO_URI ? "Configured" : "Not Configured"}
✨ ========================================
  `);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 CORS test: http://localhost:${PORT}/test-cors`);
});

module.exports = app;
