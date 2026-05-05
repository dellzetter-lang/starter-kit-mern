const service = require("./products.service");
const ApiResponse = require("../../utils/ApiResponse");

const create = async (req, res, next) => {
  try {
    const result = await service.create(req.body);
    return res.status(201).json(new ApiResponse(201, "Created", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await service.list();
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await service.getById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await service.update(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Updated", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Deleted").body);
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
