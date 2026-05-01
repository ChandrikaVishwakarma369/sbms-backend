import * as employeeService from "../services/employeeService.js";

/**
 * EMPLOYEE CONTROLLER
 * Coordinates inputs from routes to the service layer. Handles HTTP responses.
 */

// GET - FETCH with search, filter, and pagination
export const getEmployees = async (req, res, next) => {
  try {
    const { name, role, page, limit } = req.query;
    const result = await employeeService.fetchEmployees({
      name,
      role,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error); // Error Handling Middleware
  }
};

// POST - CREATE a new employee
export const addEmployee = async (req, res, next) => {
  try {
    const newEmployee = await employeeService.createEmployeeRecord(req.body);
    res.status(201).json({ success: true, employee: newEmployee });
  } catch (error) {
    console.error("❌ Add Employee Error:", error);

    // Handle MongoDB Duplicate Key Error (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please use a unique email.",
      });
    }

    // Handle Mongoose Validation Error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    next(error);
  }
};

// PUT - UPDATE complete details
export const editEmployee = async (req, res, next) => {
  try {
    const updatedEmployee = await employeeService.updateEmployeeRecord(
      req.params.id,
      req.body
    );
    if (!updatedEmployee)
      return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, employee: updatedEmployee });
  } catch (error) {
    next(error);
  }
};

// DELETE - REMOVE from system
export const removeEmployee = async (req, res, next) => {
  try {
    const deleted = await employeeService.deleteEmployeeRecord(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Employee removed" });
  } catch (error) {
    next(error);
  }
};

// PATCH - UPDATE Status only
export const changeStatus = async (req, res, next) => {
  try {
    const updatedStatus = await employeeService.updateEmployeeStatusRecord(
      req.params.id,
      req.body.status
    );
    if (!updatedStatus)
      return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, employee: updatedStatus });
  } catch (error) {
    next(error);
  }
};
