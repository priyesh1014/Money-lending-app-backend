const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  dateOfBirth: { type: Date, required: true },
  monthlySalary: { type: Number, required: true },
  password: { type: String, required: true },
  status: { type: String, default: "pending" },
  purchasePower: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", UserSchema);
