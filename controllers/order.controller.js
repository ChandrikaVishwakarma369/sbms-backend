import Order from "../models/order.model.js";
import Product from "../models/Product.js";
import Customer from "../models/customer.model.js";

// 📥 GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;

    // Build query object
    const query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch total count for pagination metadata
    const totalOrders = await Order.countDocuments(query);

    // Fetch filtered and paginated orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("customerId")
      .populate("products.productId");

    // Format response to match frontend expectations
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      customer: order.customerId?.name || "N/A",
      customerId: order.customerId?._id,
      contact: order.contact,
      products: order.products.map(item => ({
        productId: item.productId?._id,
        name: item.productId?.name || "N/A",
        quantity: item.quantity,
        price: item.price_at_that_time,
        gst: item.GST
      })),
      // For backward compatibility or simpler display in table:
      product: order.products.length > 0 
        ? order.products.length === 1 
          ? order.products[0].productId?.name || "N/A"
          : order.products.length === 2
            ? `${order.products[0].productId?.name || "N/A"}, ${order.products[1].productId?.name || "N/A"}`
            : `${order.products[0].productId?.name || "N/A"} + ${order.products.length - 1} more`
        : "N/A",
      quantity: order.products.reduce((sum, item) => sum + item.quantity, 0),
      date: order.date,
      address: order.address,
      amount: order.totalAmount,
      status: order.status,
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      currentPage: parseInt(page),
      data: formattedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// 📖 GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    // Check if id is a valid MongoDB ObjectId or orderId
    if (id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
      // It's a MongoDB ObjectId
      order = await Order.findById(id).populate("customerId").populate("products.productId");
    } else {
      // Try to find by orderId (treating it as a number)
      order = await Order.findOne({ orderId: parseInt(id) }).populate("customerId").populate("products.productId");
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: order._id.toString(),
        orderId: order.orderId,
        customer: order.customerId?.name || "N/A",
        customerId: order.customerId?._id,
        contact: order.contact,
        products: order.products.map(item => ({
          productId: item.productId?._id,
          name: item.productId?.name || "N/A",
          quantity: item.quantity,
          price: item.price_at_that_time,
          gst: item.GST
        })),
        date: order.date,
        address: order.address,
        amount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// ➕ CREATE NEW ORDER
export const createOrder = async (req, res) => {
  try {
    const { customerId, contact, products, date, address, status } = req.body;

    // 1. Validate required fields
    if (!customerId || !contact || !products || !products.length || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: customerId, contact, products, and address are all required.",
      });
    }

    // 2. Fetch Customer Details (Safe check for ID format)
    let customer;
    try {
      customer = await Customer.findById(customerId);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid Customer ID format" });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // 3. Process Products and Calculate Totals
    let totalAmount = 0;
    const processedProducts = [];

    for (const item of products) {
      const { productId, quantity } = item;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${productId} not found` });
      }

      const numQuantity = parseInt(quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).json({ success: false, message: `Invalid quantity for product ${product.name}` });
      }

      // Calculate GST for this item
      const gstRate = customer.gstNumber ? (product.gst || 0) : 0;
      const price_at_that_time = product.price;
      const subtotal = price_at_that_time * numQuantity;
      const gstAmount = subtotal * (gstRate / 100);
      const itemTotal = subtotal + gstAmount;

      totalAmount += itemTotal;

      processedProducts.push({
        productId,
        quantity: numQuantity,
        price_at_that_time,
        GST: gstRate
      });
    }

    // 4. Generate unique orderId
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const orderId = lastOrder ? lastOrder.orderId + 1 : 1001;

    // 5. Create and Save
    const newOrder = new Order({
      orderId,
      customerId,
      contact,
      products: processedProducts,
      date: date || new Date().toISOString().split("T")[0],
      address,
      totalAmount,
      status: status || "Pending",
    });

    await newOrder.save();

    // Populate for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("customerId")
      .populate("products.productId");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: populatedOrder._id.toString(),
        orderId: populatedOrder.orderId,
        customer: populatedOrder.customerId?.name || "N/A",
        customerId: populatedOrder.customerId?._id,
        contact: populatedOrder.contact,
        products: populatedOrder.products.map(item => ({
          productId: item.productId?._id,
          name: item.productId?.name || "N/A",
          quantity: item.quantity,
          price: item.price_at_that_time,
          gst: item.GST
        })),
        date: populatedOrder.date,
        address: populatedOrder.address,
        amount: populatedOrder.totalAmount,
        status: populatedOrder.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// ✏️ UPDATE ORDER
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, contact, products, date, address, status } = req.body;

    let order = await Order.findById(id.length === 24 ? id : null) || await Order.findOne({ orderId: parseInt(id) });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update basic fields
    if (customerId) order.customerId = customerId;
    if (contact) order.contact = contact;
    if (date) order.date = date;
    if (address) order.address = address;
    if (status) order.status = status;

    // Update products and recalculate if provided
    if (products && products.length > 0) {
      const customer = await Customer.findById(order.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      let totalAmount = 0;
      const processedProducts = [];

      for (const item of products) {
        const { productId, quantity } = item;
        const product = await Product.findById(productId);
        
        if (!product) {
          return res.status(404).json({ success: false, message: `Product with ID ${productId} not found` });
        }

        const numQuantity = parseInt(quantity);
        const gstRate = customer.gstNumber ? (product.gst || 0) : 0;
        const price_at_that_time = product.price;
        const subtotal = price_at_that_time * numQuantity;
        const gstAmount = subtotal * (gstRate / 100);
        const itemTotal = subtotal + gstAmount;

        totalAmount += itemTotal;

        processedProducts.push({
          productId,
          quantity: numQuantity,
          price_at_that_time,
          GST: gstRate
        });
      }

      order.products = processedProducts;
      order.totalAmount = totalAmount;
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customerId")
      .populate("products.productId");

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: {
        id: populatedOrder._id.toString(),
        orderId: populatedOrder.orderId,
        customer: populatedOrder.customerId?.name || "N/A",
        customerId: populatedOrder.customerId?._id,
        contact: populatedOrder.contact,
        products: populatedOrder.products.map(item => ({
          productId: item.productId?._id,
          name: item.productId?.name || "N/A",
          quantity: item.quantity,
          price: item.price_at_that_time,
          gst: item.GST
        })),
        date: populatedOrder.date,
        address: populatedOrder.address,
        amount: populatedOrder.totalAmount,
        status: populatedOrder.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// ❌ DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let deletedOrder;

    // Check if id is a valid MongoDB ObjectId or orderId
    if (id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
      // It's a MongoDB ObjectId
      deletedOrder = await Order.findByIdAndDelete(id);
    } else {
      // Find by orderId and delete
      deletedOrder = await Order.findOneAndDelete({ orderId: parseInt(id) });
    }

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: {
        orderId: deletedOrder.orderId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// 📊 GET ORDER STATISTICS
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const shippedOrders = await Order.countDocuments({ status: "Shipped" });
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        shippedOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

// 📈 GET SALES DATA (FOR CHART)
export const getSalesData = async (req, res) => {
  try {
    // Calculate date for 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month
    
    const startDate = sixMonthsAgo.toISOString().split("T")[0];

    const salesData = await Order.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $substr: ["$date", 0, 4] },
            month: { $substr: ["$date", 5, 2] },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format for frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create an array of the last 6 months to ensure we have data for all months even if 0 revenue
    const labels = [];
    const revenue = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthStr = (monthIdx + 1).toString().padStart(2, "0");
      
      const label = monthNames[monthIdx];
      labels.push(label);
      
      const match = salesData.find(s => s._id.year === year.toString() && s._id.month === monthStr);
      revenue.push(match ? match.revenue : 0);
    }

    res.status(200).json({
      success: true,
      data: {
        labels,
        revenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sales data",
      error: error.message,
    });
  }
};