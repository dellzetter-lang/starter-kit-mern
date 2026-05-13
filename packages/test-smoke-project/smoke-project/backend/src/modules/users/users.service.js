const usersModel = require("./users.model");
const ApiError = require("../../utils/ApiError");
const { v4: uuidv4 } = require("uuid");


const createUsers = async (payload) => {
  // Sanitize input
    if (payload.name && typeof payload.name === "string") payload.name = payload.name.trim();
  
  // Generate code/slug if needed
  // No auto-generated field
  
  return await usersModel.create(payload);
};

const getAllUserss = async (filters = {}) => {
  const query = usersModel.find({});
    if (filters.filters.name) query = query.where('name', filters.filters.name);
  return await query.exec();
};

const getUsersById = async (id) => {
  const doc = await usersModel.findById(id);
  if (!doc) throw new ApiError(404, "users not found");
  return doc;
};

const getUsersByUnique = async (field, value) => {
  return await usersModel.findOne({ [field]: value });
};

const updateUsers = async (id, updates) => {
    if (updates.name && typeof updates.name === "string") updates.name = updates.name.trim();
  const doc = await usersModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, "users not found");
  return doc;
};

const deleteUsers = async (id) => {
  // Soft delete pattern: set deleted=true, deletedAt timestamp
  // For now hard delete:
  const doc = await usersModel.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "users not found");
  return doc;
};

// Advanced: Batch operations


module.exports = {
  createUsers,
  getAllUserss,
  getUsersById,
  getUsersByUnique,
  updateUsers,
  deleteUsers,
  
};
