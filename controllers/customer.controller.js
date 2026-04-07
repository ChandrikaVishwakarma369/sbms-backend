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
      gstNumber: c.gstNumber,
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
        gstNumber: customer.gstNumber,
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
    const { name, email, phone, gstNumber } = req.body;

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

    if (gstNumber) {
      const gstExists = await Customer.findOne({ gstNumber });
      if (gstExists) {
        return res.status(400).json({
          success: false,
          message: "GST number already exists",
        });
      }
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      gstNumber: gstNumber || null,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        gstNumber: customer.gstNumber,
        status: customer.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? "GST number already exists" : "Error creating customer",
      error: error.message,
    });
  }
};

// ✏️ UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, gstNumber, status } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check for duplicate GST if provided and different from current
    if (gstNumber && gstNumber !== customer.gstNumber) {
      const gstExists = await Customer.findOne({ gstNumber, _id: { $ne: req.params.id } });
      if (gstExists) {
        return res.status(400).json({
          success: false,
          message: "GST number already exists",
        });
      }
    }

    // Update fields
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.gstNumber = gstNumber !== undefined ? (gstNumber || null) : customer.gstNumber;
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
        gstNumber: updatedCustomer.gstNumber,
        status: updatedCustomer.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? "GST number already exists" : "Error updating customer",
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
    const customersWithGST = await Customer.countDocuments({ gstNumber: { $ne: "", $exists: true } });

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
