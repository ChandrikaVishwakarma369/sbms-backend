import Employee from "../models/Employee.js";

/**
 * EMPLOYEE SERVICE
 * Clean architecture layer: Interacts directly with MongoDB using Mongoose.
 */

// GET all with Search, Filter & Pagination
export const fetchEmployees = async (queryObj) => {
  const { name, role, page = 1, limit = 10 } = queryObj;

  const filter = {};
  if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
  if (role) filter.role = role.toUpperCase();

  const total = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { total, employees, page, limit };
};

// CREATE new employee
export const createEmployeeRecord = async (data) => {
  return await Employee.create(data);
};

// UPDATE employee info
export const updateEmployeeRecord = async (id, data) => {
  return await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

// DELETE employee record
export const deleteEmployeeRecord = async (id) => {
  return await Employee.findByIdAndDelete(id);
};

// UPDATE employee status
export const updateEmployeeStatusRecord = async (id, status) => {
  return await Employee.findByIdAndUpdate(id, { status: status.toUpperCase() }, { new: true });
};
