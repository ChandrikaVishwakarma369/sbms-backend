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
      .populate("productId");

    // Format response to match frontend expectations
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      customer: order.customerId?.name || "N/A",
      customerId: order.customerId?._id,
      contact: order.contact,
      product: order.productId?.name || "N/A",
      productId: order.productId?._id,
      quantity: order.quantity,
      price_at_that_time: order.price_at_that_time,
      GST: order.GST,
      date: order.date,
      address: order.address,
      amount: order.totalAmount, // Map totalAmount to amount for frontend compatibility
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
      order = await Order.findById(id).populate("customerId").populate("productId");
    } else {
      // Try to find by orderId (treating it as a number)
      order = await Order.findOne({ orderId: parseInt(id) }).populate("customerId").populate("productId");
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
        product: order.productId?.name || "N/A",
        productId: order.productId?._id,
        quantity: order.quantity,
        price_at_that_time: order.price_at_that_time,
        GST: order.GST,
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
    const { customerId, contact, productId, quantity, date, address, status } = req.body;

    // 1. Validate required fields
    if (!customerId || !contact || !productId || !quantity || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: customerId, contact, productId, quantity, and address are all required.",
      });
    }

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number greater than 0",
      });
    }

    // 2. Fetch Product Details (Safe check for ID format)
    let product;
    try {
      product = await Product.findById(productId);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid Product ID format" });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 3. Fetch Customer Details (Safe check for ID format)
    let customer;
    try {
      customer = await Customer.findById(customerId);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid Customer ID format" });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // 4. Calculate GST Rate
    const gstRate = customer.gstNumber ? (product.gst || 0) : 0;
    
    // 5. Calculations
    const price_at_that_time = product.price;
    const subtotal = price_at_that_time * numQuantity;
    const gstAmount = subtotal * (gstRate / 100);
    const totalAmount = subtotal + gstAmount;

    // 6. Generate unique orderId
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const orderId = lastOrder ? lastOrder.orderId + 1 : 1001;

    // 7. Create and Save
    const newOrder = new Order({
      orderId,
      customerId,
      contact,
      productId,
      quantity: numQuantity,
      price_at_that_time,
      GST: gstRate,
      date: date || new Date().toISOString().split("T")[0],
      address,
      totalAmount,
      status: status || "Pending",
    });

    await newOrder.save();

    // Populate for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("customerId")
      .populate("productId");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: populatedOrder._id.toString(),
        orderId: populatedOrder.orderId,
        customer: populatedOrder.customerId?.name || "N/A",
        customerId: populatedOrder.customerId?._id,
        contact: populatedOrder.contact,
        product: populatedOrder.productId?.name || "N/A",
        productId: populatedOrder.productId?._id,
        quantity: populatedOrder.quantity,
        price_at_that_time: populatedOrder.price_at_that_time,
        GST: populatedOrder.GST,
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
    const { customerId, contact, productId, quantity, date, address, status } = req.body;

    let order = await Order.findById(id.length === 24 ? id : null) || await Order.findOne({ orderId: parseInt(id) });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update fields if provided
    if (customerId) order.customerId = customerId;
    if (contact) order.contact = contact;
    if (productId) order.productId = productId;
    if (quantity) order.quantity = quantity;
    if (date) order.date = date;
    if (address) order.address = address;
    if (status) order.status = status;

    // Recalculate if critical fields changed
    if (customerId || productId || quantity) {
      const product = await Product.findById(order.productId);
      const customer = await Customer.findById(order.customerId);

      if (product && customer) {
        order.price_at_that_time = product.price;
        const gstRate = customer.gstNumber ? (product.gst || 0) : 0;
        order.GST = gstRate;
        
        const subtotal = order.price_at_that_time * order.quantity;
        const gstAmount = subtotal * (gstRate / 100);
        order.totalAmount = subtotal + gstAmount;
      }
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customerId")
      .populate("productId");

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: {
        id: populatedOrder._id.toString(),
        orderId: populatedOrder.orderId,
        customer: populatedOrder.customerId?.name || "N/A",
        customerId: populatedOrder.customerId?._id,
        contact: populatedOrder.contact,
        product: populatedOrder.productId?.name || "N/A",
        productId: populatedOrder.productId?._id,
        quantity: populatedOrder.quantity,
        price_at_that_time: populatedOrder.price_at_that_time,
        GST: populatedOrder.GST,
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