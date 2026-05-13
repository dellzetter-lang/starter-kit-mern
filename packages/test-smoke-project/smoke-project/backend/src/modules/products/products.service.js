const productsModel = require("./products.model");
const ApiError = require("../../utils/ApiError");

const create = async (payload) => {
  return await productsModel.create(payload);
};

const list = async () => {
  return await productsModel.find({});
};

const getById = async (id) => {
  const doc = await productsModel.findById(id);
  if (!doc) throw new ApiError(404, "products not found");
  return doc;
};

const update = async (id, updates) => {
  return await productsModel.findByIdAndUpdate(id, updates, { new: true });
};

const remove = async (id) => {
  const doc = await productsModel.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "products not found");
  return doc;
};

module.exports = { create, list, getById, update, remove };
