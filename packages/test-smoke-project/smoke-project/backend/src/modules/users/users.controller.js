const service = require("./users.service");
const ApiResponse = require("../../utils/ApiResponse");

const create = async (req, res, next) => {
  try {
    const result = await service.createUsers(req.body);
    return res.status(201).json(new ApiResponse(201, "Users created", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sort = "createdAt", order = "desc", ...filters } = req.query;
    const result = await service.getAllUserss({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      order,
      filters
    });
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await service.getUsersById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await service.updateUsers(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Updated", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteUsers(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Deleted").body);
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
