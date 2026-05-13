const mongoose = require("mongoose");
const { env } = require("../../config/env");

const productsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // TODO: add fields
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productsSchema);
