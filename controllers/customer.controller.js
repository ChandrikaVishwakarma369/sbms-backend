import Customer from "../models/customer.model.js";

// 📥 GET ALL CUSTOMERS
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const formattedCustomers = customers.map((c) => ({
      id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      gst: c.gst,
      status: c.status,
    }));

    res.status(200).json({
      success: true,
      count: formattedCustomers.length,
      data: formattedCustomers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customers",
      error: error.message,
    });
  }
};

// 📖 GET SINGLE CUSTOMER
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        gst: customer.gst,
        status: customer.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer",
      error: error.message,
    });
  }
};

// ➕ CREATE NEW CUSTOMER
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, gst } = req.body;

    // Manual validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, phone",
      });
    }

    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      gst,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        gst: customer.gst,
        status: customer.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating customer",
      error: error.message,
    });
  }
};

// ✏️ UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, gst, status } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Update fields
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.gst = gst !== undefined ? gst : customer.gst;
    customer.status = status || customer.status;

    const updatedCustomer = await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        gst: updatedCustomer.gst,
        status: updatedCustomer.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating customer",
      error: error.message,
    });
  }
};

// ❌ DELETE CUSTOMER
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting customer",
      error: error.message,
    });
  }
};

// 📊 GET CUSTOMER STATS
export const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: "Active" });
    const customersWithGST = await Customer.countDocuments({ gst: { $ne: "", $exists: true } });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        customersWithGST,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer stats",
      error: error.message,
    });
  }
};
