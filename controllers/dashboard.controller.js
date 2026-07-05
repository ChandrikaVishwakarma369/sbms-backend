import Order from "../models/order.model.js";
import Product from "../models/Product.js";
import Customer from "../models/customer.model.js";
import Employee from "../models/Employee.js";
import Invoice from "../models/Invoice.js";

export const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user?.role?.toUpperCase() === "ADMIN";
    const userFilter = isAdmin ? {} : { createdBy: req.userId };

    const totalCustomers = await Customer.countDocuments(isAdmin ? {} : userFilter);
    const totalOrders = await Order.countDocuments(isAdmin ? {} : userFilter);
    const totalProducts = await Product.countDocuments();
    const totalEmployees = isAdmin ? await Employee.countDocuments() : 0;

    const revenueResult = await Order.aggregate([
      {
        $match: isAdmin ? {} : { createdBy: req.user._id },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const totalInvoices = await Invoice.countDocuments(isAdmin ? {} : { createdBy: req.user._id });

    const responseData = {
      totalCustomers,
      totalOrders,
      totalProducts,
      totalRevenue,
      totalInvoices,
    };

    if (isAdmin) {
      responseData.totalEmployees = totalEmployees;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
