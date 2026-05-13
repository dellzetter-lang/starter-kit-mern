const express = require("express");
const controller = require("./users.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/auth.middleware").authenticate;
const requireRole = require("../../middlewares/auth.middleware").requireRole;
const { query } = require("express-validator");

const router = express.Router();

// Create — requires auth
router.post("/", authenticate, 
  validate(require("../../utils/validators/users.validator").createUsersSchema), 
  controller.create
);

// List — with pagination & filtering
router.get("/", authenticate,
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("sort").optional().isIn("name"),
  query("order").optional().isIn(["asc", "desc"]),
  query("name").optional().isString(),
  validate,
  controller.list
);

// Single record
router.get("/:id", authenticate, controller.getOne);

// Update
router.put("/:id", authenticate, 
  validate(require("../../utils/validators/users.validator").updateUsersSchema), 
  controller.update
);

// Delete — admin only
router.delete("/:id", authenticate, requireRole("admin"), controller.remove);

module.exports = router;
