import Employee from "../models/Employee.js";

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const { name, role } = req.query;
    const filter = {};
    
    if (name) filter.name = { $regex: name, $options: "i" };
    if (role) filter.role = role.toUpperCase();

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new employee
// @route   POST /api/employees
// @access  Private/Admin
export const addEmployee = async (req, res) => {
  try {
    const { name, email, salary, status } = req.body;

    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: "Employee already exists" });
    }

    const employee = await Employee.create({
      name,
      email,
      salary,
      status: status || "ACTIVE",
      role: "EMPLOYEE", // Default role for safety, as per requirements
    });

    res.status(201).json({ success: true, employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};