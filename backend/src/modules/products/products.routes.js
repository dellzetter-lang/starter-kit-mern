const express = require("express");
const controller = require("./products.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/auth.middleware").authenticate;

const validator = require("./products.validator");

const router = express.Router();

router.post("/", authenticate, validate(validator.createSchema), controller.create);
router.get("/", authenticate, controller.list);
router.get("/:id", authenticate, controller.getOne);
router.put("/:id", authenticate, validate(validator.updateSchema), controller.update);
router.delete("/:id", authenticate, controller.remove);

module.exports = router;
