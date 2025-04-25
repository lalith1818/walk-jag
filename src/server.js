import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Log environment variables for debugging
console.log('Environment variables loaded:', {
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? '***' : 'not set',
});

import express from 'express';
// import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connect, Schema, model, mongoose } from "mongoose";
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';
import { ObjectId } from 'mongodb';
import paymentRoutes from './routes/payment.js';

// import nodemailer from 'nodemailer';
// import Razorpay from 'razorpay';
// import { v4 as uuidv4 } from 'uuid';
// import crypto from 'crypto';

const app = express();
app.use(express.json({limit : '50mb'}));

// ✅ CORS Configuration (Allow Frontend Requests)
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173','http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI ;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

//  const otpStore = {}; // Temporary storage for OTPs

// // Configure Nodemailer transporter (Use your email credentials)
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // You can use other providers like Outlook, Yahoo, etc.
//   auth: {
//     user: process.env.EMAIL_USER, // Your email (e.g., myemail@gmail.com)
//     pass: process.env.EMAIL_PASS, // App Password (not your actual email password)
//   },
// });

// ✅ Send OTP Email
// app.post('/api/send-otp', async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ success: false, message: "Email is required" });
//   }

//   // Generate a 6-digit OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore[email] = otp; // Store OTP for verification

//   // Email message details
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP is: ${otp}. This OTP is valid for 5 minutes.`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
    
//     console.log(`✅ OTP sent successfully!`);
//     console.log(`📧 Sent to: ${email}`);
//     console.log(`🔢 OTP: ${otp}`);
    
//     res.status(200).json({ 
//         success: true, 
//         message: "OTP sent successfully 🎉" 
//     });
// } catch (error) {
//     console.error("❌ Failed to send OTP email:");
//     console.error(`📌 Error: ${error.message}`);

//     res.status(500).json({ 
//         success: false, 
//         message: "Oops! Something went wrong. Unable to send OTP email. 🚨"
//     });
// }
// });

// // ✅ Verify OTP & Store Order
// app.post('/api/verify-otp', async (req, res) => {
//   const { email, otp, name, mobile, address, city, items, total } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ success: false, message: "Email and OTP are required" });
//   }

//   if (otpStore[email] !== otp) {
//     return res.status(400).json({ success: false, message: "Invalid OTP" });
//   }

//   try {
//     const newOrder = new Order({
//       name,
//       email,
//       mobile,
//       address,
//       city,
//       items,
//       total,
//     });

//     await newOrder.save(); // Save order to MongoDB

//     delete otpStore[email]; // Remove OTP after verification

//     res.json({ success: true, message: "OTP verified and order placed successfully" });
//   } catch (error) {
//     console.error("Error storing order:", error);
//     res.status(500).json({ success: false, message: "Order storage failed" });
//   }
// });
  
  

// ✅ User Schema & Model
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // Custom user ID
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  password: String, // Hashed password
  loginDate: { type: Date, default: Date.now },
});

// Pre-save middleware to generate userId
userSchema.pre("save", async function (next) {
  if (!this.userId) {
    const lastUser = await mongoose.model("User").findOne().sort({ _id: -1 });

    let newUserId = "u-1";
    if (lastUser && lastUser.userId) {
      const lastId = parseInt(lastUser.userId.split("-")[1], 10);
      newUserId = `u-${lastId + 1}`;
    }

    this.userId = newUserId;
  }
  next();
});

const User = mongoose.model("User", userSchema);


// Get user by ID
// app.get('/users/:id', async (req, res) => {
//   try {
//     // Fetch the user by _id, and ensure all fields are returned
//     const user = await User.findById(req.params.id).select('name email mobile address');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Log the user to confirm if all fields are there
//     console.log('Fetched User:', {
//       name: user.name,
//       email: user.email,
//       mobile: user.mobile,
//       address: user.address
//     });

//     res.json({
//       name: user.name,
//       email: user.email,
//       mobile: user.mobile,
//       address: user.address
//     });
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });




// // Update user by ID
// app.put('/users/:id', async (req, res) => {
//   try {
//     const { name, mobile, address } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, mobile, address },
//       { new: true }
//     ).select('name email mobile address');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({
//       name: updatedUser.name,
//       email: updatedUser.email,
//       mobile: updatedUser.mobile,
//       address: updatedUser.address
//     });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get orders by userId (custom field)
// app.get('/orders/user/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log('Received userId:', userId);

//     const orders = await mongoose.connection.db.collection('orders').find({ userId }).toArray();
//     console.log('Orders found:', orders.length);
//     res.json(orders);
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Route to get user by Mongo _id
app.get('/users/:id', async (req, res) => {
  try {
    const user = await mongoose.connection.db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Debugging the structure of the fetched user
    console.log('Fetched User:', user);
    
    // Extract userId from the user document (adjust based on actual data structure)
    const userId = user.userId || user._id.toString(); // If userId doesn't exist, use _id
    console.log('Resolved userId:', userId);
    
    res.json({ ...user, userId }); // Send the user data along with the userId
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to update user by Mongo _id
app.put('/users/:id', async (req, res) => {
  try {
    const updateData = req.body;
    const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    res.json(result.value);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get orders by userId (e.g. "u-2")
// app.get('/orders/user/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log('Received userId:', userId);

//     const orders = await mongoose.connection.db.collection('orders').find({ userId }).toArray();
//     console.log('Orders found:', orders.length);
//     res.json(orders);
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Route to get orders by userId
app.get('/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Received userId:', userId);

    // Fetch orders from the database
    const orders = await mongoose.connection.db.collection('orders').find({ userId }).toArray();

    // Debugging: Check the raw orders fetched
    console.log('Raw orders:', orders);

    if (orders.length === 0) {
      console.log('No orders found for this user.');
      return res.json([]);
    }

    // Map through orders to ensure they have the correct data structure, including total amount
    const formattedOrders = orders.map((order) => {
      console.log('Processing order:', order);
      return {
        orderId: order.orderId,
        items: order.items || [],
        totalAmount: order.total || 0, // Ensure total is passed as totalAmount
        status: order.status || 'Pending',
        createdAt: order.createdAt || new Date(),
      };
    });

    console.log('Formatted orders to send:', formattedOrders);

    res.json(formattedOrders); // Send back formatted orders with correct totalAmount
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default User;

// ✅ Contact Schema & Model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// const UserSchema = new mongoose.Schema({
//   userName: String,
//   email: String,
//   loginDate: Date
// });
// const User = mongoose.model("User", UserSchema);

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, mobile, address, password  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      name,
      email,
      mobile,
      address,
      password: hashedPassword,
      loginDate: Date.now()
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed', error });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error });
  }
});

// ✅ Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ Get Logged-in User Details Route
app.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error });
  }
});

// ✅ Contact Form Submission Route
//  
app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    res.status(201).json({ message: '✅ Message sent successfully!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: 'Error saving message', error });
  }
});

// ✅ Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

const ProductSchema = new Schema({
  productId: {
    type: String,
    unique: true,
  },
  name: String,
  category: String,
  brand: String,
  size: Number,
  price: Number,
  stock: Number,
  image: String,
});

// Pre-save middleware to generate productId
ProductSchema.pre('save', async function (next) {
  if (this.isNew && !this.productId) {
    const Product = mongoose.model('Product');
    const lastProduct = await Product.findOne().sort({ _id: -1 });

    let lastNumber = 0;
    if (lastProduct && lastProduct.productId) {
      const match = lastProduct.productId.match(/prdt-(\d+)/);
      if (match) {
        lastNumber = parseInt(match[1]);
      }
    }

    this.productId = `prdt-${lastNumber + 1}`;
  }

  next();
});

const Product = model("Product", ProductSchema);

// Routes

// Get all products
app.get("/api/products", async (req, res) => {
  try {
      const products = await Product.find();
      res.json(products);
  } catch (err) {
      res.status(500).json({ error: "Server error" });
  }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.json(newProduct);
  } catch (err) {
      res.status(500).json({ error: "Failed to add product" });
  }
});

// Update a Product
app.put("/api/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
});

app.get("/api/users", async (req, res) => {
  try {
      const users = await User.find().select("-password"); // Exclude password
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Fetch Single User by ID
app.get("/api/users/:id", async (req, res) => {
  try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Delete a user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
  }
});

// Delete Products from Admin
app.delete("/api/products/:id", async (req, res) => {
  try {
      const productId = req.params.id;
      const result = await Product.findByIdAndDelete(productId);

      if (!result) {
          return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
  }
});

// Storage settings (Uploads to 'uploads/' folder)
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  }
});

const upload = multer({ storage });

// Serve static files from 'uploads' folder
app.use("/uploads", express.static("uploads"));

// Product Image Upload Endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` }); // Return image URL
});


// ✅ Order schema
// const OrderSchema = new mongoose.Schema({
//   orderId: { type: String, unique: true },
//   name: String,
//   email: String,
//   mobile: String,
//   address: String,
//   city: String,
//   items: Array,
//   total: Number,
//   status: {
//     type: String,
//     enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
//     default: 'Pending',
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// // Pre-save hook to generate a unique order ID before saving
// OrderSchema.pre("save", async function (next) {
//     if (!this.orderId) {
//         try {
//             // Find and update the counter
//             const counter = await Counter.findByIdAndUpdate(
//                 { _id: "orderId" },
//                 { $inc: { sequence_value: 1 } },
//                 { new: true, upsert: true }
//             );
//             
//             // Set the unique order ID
//             this.orderId = `ORD-${counter.sequence_value}`;
//         } catch (error) {
//             return next(error);
//         }
//     }
//     next();
// });

// const Order = mongoose.model("Order", OrderSchema);

// ✅ Counter Schema (for order ID auto-increment)
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

// ✅ Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  userId: { type: String, required: true }, // 👈 This will store "u-1"
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      selectedSize: String,
    }
  ],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate orderId (ORD-1, ORD-2, ...)
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'order' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderId = `ORD-${counter.seq}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const Order = mongoose.model('Order', orderSchema);

// ✅ Place Order API
app.post('/api/place-order', async (req, res) => {
  try {
    const {
      userId, // This is MongoDB _id from frontend
      name,
      email,
      phone,
      address,
      city,
      items,
      total,
    } = req.body;

    // Find user by MongoDB _id and get their custom userId
    const user = await User.findById(userId);
    if (!user || !user.userId) {
      return res.status(404).json({ success: false, message: 'User not found or missing custom userId' });
    }

    // Validate fields
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing or invalid items' });
    }
    if (typeof total !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid total' });
    }

    for (const field of ['name', 'email', 'phone', 'address', 'city']) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `Missing ${field}` });
      }
    }

    // Save order
    const newOrder = new Order({
      userId: user.userId, // Use the custom userId like "u-1"
      name,
      email,
      phone,
      address,
      city,
      items: items.map(item => ({
        productId: item.productId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize?.toString() || '',
      })),
      total,
    });

    await newOrder.save();

    console.log(`✅ Order ${newOrder.orderId} placed for ${user.userId}`);
    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder.orderId,
    });
  } catch (error) {
    console.error('❌ Order placement error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// 1. Get User by _id to fetch full user information
app.get('/users/:mongoId', async (req, res) => {
  try {
    const user = await User.findById(req.params.mongoId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Get Orders by userId
app.get('/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Feedback route
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Contact.find().sort({ createdAt: -1 }); // latest first
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Order Schema
// const orderSchema = new mongoose.Schema({
//   razorpay_payment_id: { type: String, required: true },
//   razorpay_order_id: { type: String, required: true, unique: true },
//   razorpay_signature: { type: String, required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
//   user: {
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     address: { type: String, required: true },
//     city: { type: String, required: true },
//   },
//   items: [
//     {
//       productId: { type: String, required: true }, // <-- this holds 'prdt-1', 'prdt-2', etc.
//       name: { type: String, required: true },
//       price: { type: Number, required: true },
//       quantity: { type: Number, required: true },
//       selectedSize: { type: String, required: true },
//     },
//   ],
//   totalAmount: { type: Number, required: true },
//   status: { type: String, default: 'Pending' },
//   createdAt: { type: Date, default: Date.now },
// });

// const Order = mongoose.model('Order', orderSchema);

// // Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TvIJ3qmt5faM08',
//   key_secret: process.env.RAZORPAY_KEY_SECRET || 'Z1gU6x7eEnJom3AYwyf0kPHG',
// });

// // Route: Create Razorpay order
// app.post('/api/payment/create-order', async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const options = {
//       amount: amount * 100, // in paisa
//       currency: 'INR',
//       receipt: crypto.randomBytes(10).toString('hex'),
//     };
//     const order = await razorpay.orders.create(options);
//     console.log('✅ Razorpay order created:', order);
//     res.status(200).json(order);
//   } catch (error) {
//     console.error('❌ Error creating Razorpay order:', error);
//     res.status(500).json({ message: 'Error creating order', error });
//   }
// });

// // Route: Store order and send email
// app.post('/api/payment/store-order', async (req, res) => {
//   const {
//     razorpay_payment_id,
//     razorpay_order_id,
//     razorpay_signature,
//     user,
//     userId = null,
//     items,
//     totalAmount,
//   } = req.body;

//   try {
//     // Validate items array
//     console.log("Received items:", items); // Debug log to see the structure of items
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: 'Items are required' });
//     }

//     // Validate each item and log its content for debugging
//     const validatedItems = items.map((item, i) => {
//       console.log(`Validating item at index ${i}:`, item);

//       // Ensure `productId` exists and is valid
//       const id = item.productId || item.id || item._id;
//       if (!id || !item.name || !item.price || !item.quantity || !item.selectedSize) {
//         throw new Error(`Item at index ${i} is missing required fields. ProductId: ${item.productId}`);
//       }

//       // Return the validated item
//       return {
//         productId: id,  // Ensure the correct field is used here
//         name: item.name,
//         price: item.price,
//         quantity: item.quantity,
//         selectedSize: item.selectedSize,
//       };
//     });

//     // Verify Razorpay payment signature
//     const generated_signature = crypto
//       .createHmac('sha256', razorpay.key_secret)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: 'Invalid signature' });
//     }

//     // Check if the order already exists
//     const existingOrder = await Order.findOne({ razorpay_order_id });
//     if (existingOrder) {
//       return res.status(400).json({ success: false, message: 'Order already exists' });
//     }

//     // Create and save the new order
//     const newOrder = new Order({
//       razorpay_payment_id,
//       razorpay_order_id,
//       razorpay_signature,
//       user,
//       userId,
//       items: validatedItems,
//       totalAmount,
//       status: 'Paid',
//     });

//     const savedOrder = await newOrder.save();

//     // Send confirmation email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_SENDER,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_SENDER,
//       to: user.email,
//       subject: 'Order Confirmation - Walk & Jag Shoe Shop',
//       html: `
//         <h2>Thank you for your order, ${user.name}!</h2>
//         <p><strong>Order ID:</strong> ${savedOrder._id}</p>
//         <p><strong>Total:</strong> Rs.${totalAmount}</p>
//         <p><strong>Status:</strong> ${savedOrder.status}</p>
//         <hr />
//         <p>We'll let you know once your shoes are on the way!</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     // Respond with success
//     res.status(200).json({ success: true, message: 'Order stored and email sent successfully' });

//   } catch (error) {
//     console.error('❌ Error storing order:', error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });


// Route: Get all orders (admin dashboard)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// const CounterSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   sequence_value: { type: Number, default: 1 },
// });

// // Create a model for the counter
// const Counter = mongoose.model("Counter", CounterSchema);

// export { Order, Counter };

//display order table in admin side
// API to fetch all orders
app.get("/api/orders", async (req, res) => {
  try {
      const orders = await Order.find();
      res.json(orders);
  } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
  }
});

async function updateOrders() {
  try {
    const result = await Order.updateMany({}, { $set: { status: "Pending" } });
    console.log(`Updated ${result.modifiedCount} orders with status field.`);
  } catch (error) {
    console.error("Error updating orders:", error);
  }
}

// Run the update function
//updateOrders();
// app.put('/api/orders/:id/status', async (req, res) => {
//   const { status } = req.body;
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     res.json({ success: true, order: updatedOrder });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Update failed' });
//   }
// });

app.put("/api/orders/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

      if (!updatedOrder) {
          return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
  } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
  }
});

// Get user's orders
app.get('/users/:id/orders', async (req, res) => {
  try {
    console.log('Fetching orders for user ID:', req.params.id);
    
    // First verify if the user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Then fetch their orders
    const orders = await Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 });
    
    console.log('Found orders:', orders);
    
    if (!orders || orders.length === 0) {
      console.log('No orders found for user:', req.params.id);
      return res.json([]);
    }

    // Transform the orders to match the expected format
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch recent 5 orders
app.get("/api/orders/recent", async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Format response for frontend
    const formatted = recentOrders.map((order) => ({
      orderId: order.orderId,
      customerName: order.name,
      product: order.items?.[0]?.name || "N/A",
      status: order.status,
      amount: order.total,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
});

// Route: Get total order count
app.get('/api/orders/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count orders' });
  }
});

// Route: Get total product count
app.get('/api/products/count', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count products' });
  }
});

// Mount payment routes before other routes
app.use('/api', paymentRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
