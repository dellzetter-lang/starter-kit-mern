const express = require("express");
const controller = require("./products.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/auth.middleware").authenticate;

const router = express.Router();

router.post("/", authenticate, controller.create);
router.get("/", authenticate, controller.list);
router.get("/:id", authenticate, controller.getOne);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.remove);

module.exports = router;
