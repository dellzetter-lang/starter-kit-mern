const mongoose = require("mongoose");


const usersSchema = new mongoose.Schema(
  {
        name: { type: String, trim: true, minlength: 3, maxlength: 100, required: true }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; } },
    toObject: { virtuals: true }
  }
);

// Virtuals for computed fields (if needed)
// usersSchema.virtual('fullName').get(function() { return this.firstName + ' ' + this.lastName; });

module.exports = mongoose.model("Users", usersSchema);
