import Customer from "../models/customer.model.js";

// 📥 GET ALL CUSTOMERS
export const getCustomers = async (req, res) => {
  try {
    const { status, gst } = req.query;
    let query = {};

    // Filter by Status
    if (status && status !== "All") {
      query.status = status;
    }

    // Filter by GST
    if (gst === "true") {
      query.gstNumber = { $ne: "", $exists: true };
    } else if (gst === "false") {
      query.$or = [
        { gstNumber: "" },
        { gstNumber: { $exists: false } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

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

    // Normalizing GST: Convert empty string or whitespace to undefined
    // This is the production standard for 'sparse' unique indexes in MongoDB
    const finalGst = gstNumber?.trim() || undefined;

    // Manual validation for required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, phone",
      });
    }

    // Check for duplicate Email
    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    // Check for duplicate GST (only if provided)
    if (finalGst) {
      const gstExists = await Customer.findOne({ gstNumber: finalGst });
      if (gstExists) {
        return res.status(400).json({
          success: false,
          message: "GST number already exists",
        });
      }
    }

    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone,
      gstNumber: finalGst,
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
    let message = "Error creating customer";
    if (error.code === 11000) {
      // Intelligently identify which field caused the conflict
      if (error.message.includes("email")) message = "Customer with this email already exists";
      else if (error.message.includes("gstNumber")) message = "GST number already exists";
      else message = "Duplicate record found";
    }
    res.status(400).json({
      success: false,
      message,
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

    // Normalizing GST
    const finalGst = gstNumber?.trim() || undefined;

    // Check for duplicate Email (if changed)
    if (email && email !== customer.email) {
      const emailExists = await Customer.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Customer with this email already exists",
        });
      }
    }

    // Check for duplicate GST (if changed and provided)
    if (finalGst && finalGst !== customer.gstNumber) {
      const gstExists = await Customer.findOne({ gstNumber: finalGst, _id: { $ne: req.params.id } });
      if (gstExists) {
        return res.status(400).json({
          success: false,
          message: "GST number already exists",
        });
      }
    }

    // Update fields
    customer.name = name || customer.name;
    customer.email = (email || customer.email).toLowerCase();
    customer.phone = phone || customer.phone;
    customer.status = status || customer.status;
    customer.gstNumber = finalGst;

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
    let message = "Error updating customer";
    if (error.code === 11000) {
      if (error.message.includes("email")) message = "Customer with this email already exists";
      else if (error.message.includes("gstNumber")) message = "GST number already exists";
      else message = "Duplicate record found";
    }
    res.status(400).json({
      success: false,
      message,
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