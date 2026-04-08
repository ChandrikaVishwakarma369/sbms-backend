import Order from "../models/order.model.js";

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
      .limit(parseInt(limit));

    // Format response to match frontend expectations
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      customer: order.customer,
      contact: order.contact,
      product: order.product,
      date: order.date,
      address: order.address,
      amount: order.amount,
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
      order = await Order.findById(id);
    } else {
      // Try to find by orderId (treating it as a number)
      order = await Order.findOne({ orderId: parseInt(id) });
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
        customer: order.customer,
        contact: order.contact,
        product: order.product,
        date: order.date,
        address: order.address,
        amount: order.amount,
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
    const { customer, contact, product, date, address, amount, status } = req.body;

    // Validate required fields
    if (!customer || !contact || !product || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: customer, contact, product, amount",
      });
    }

    // Generate unique orderId
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const orderId = lastOrder ? lastOrder.orderId + 1 : 1001;

    const newOrder = new Order({
      orderId,
      customer,
      contact,
      product,
      date: date || new Date().toISOString().split("T")[0],
      address,
      amount,
      status: status || "Pending",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: newOrder._id.toString(),
        orderId: newOrder.orderId,
        customer: newOrder.customer,
        contact: newOrder.contact,
        product: newOrder.product,
        date: newOrder.date,
        address: newOrder.address,
        amount: newOrder.amount,
        status: newOrder.status,
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
    const { customer, contact, product, date, address, amount, status } = req.body;

    let updatedOrder;

    // Check if id is a valid MongoDB ObjectId or orderId
    if (id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
      // It's a MongoDB ObjectId
      updatedOrder = await Order.findByIdAndUpdate(
        id,
        { customer, contact, product, date, address, amount, status },
        { new: true, runValidators: true }
      );
    } else {
      // Find by orderId and update
      updatedOrder = await Order.findOneAndUpdate(
        { orderId: parseInt(id) },
        { customer, contact, product, date, address, amount, status },
        { new: true, runValidators: true }
      );
    }

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: {
        id: updatedOrder._id.toString(),
        orderId: updatedOrder.orderId,
        customer: updatedOrder.customer,
        contact: updatedOrder.contact,
        product: updatedOrder.product,
        date: updatedOrder.date,
        address: updatedOrder.address,
        amount: updatedOrder.amount,
        status: updatedOrder.status,
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
