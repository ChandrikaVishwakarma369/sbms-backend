import Employee from "../models/Employee.js";

// GET all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD employee
export const addEmployee = async (req, res) => {
  try {
    const { name, email, salary, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name & Email required" });
    }

    const employee = new Employee({
      name,
      email,
      salary,
      status,
    });

    const saved = await employee.save();
    res.status(201).json({ employee: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE employee
export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ employee: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE employee
export const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};