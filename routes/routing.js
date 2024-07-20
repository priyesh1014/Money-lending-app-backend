const express = require("express");
const router = express.Router();
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Function to calculate age from date of birth
function calculateAge(dateOfBirth) {
  const difference = Date.now() - dateOfBirth.getTime();
  const ageDt = new Date(difference);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// Signup with Validation API
router.post("/signup", async (req, res) => {
  const {
    phone,
    email,
    name,
    dateOfBirth,
    purchasePower,
    monthlySalary,
    password,
  } = req.body;
  const age = calculateAge(new Date(dateOfBirth));

  // Creating the unverified user model (status: pending)
  try {
    // No need to specify registration date and purchase power
    // as registration date defaults to current date
    const user = new User({
      phone,
      email,
      name,
      dateOfBirth,
      monthlySalary,
      purchasePower,
      password: await bcrypt.hash(password, 10),
      status: "approved",
    });
    await user.save();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  // Validation checks for age and monthly salary
  if (age < 20) {
    return res.status(400).json({ msg: "User must be above 20 years of age." });
  } else if (monthlySalary < 25000) {
    return res.status(400).json({ msg: "Monthly salary must be 25k or more." });
  }

  try {
    //approve the user
    const user = await User.findOne({ email });
    user.status = "approved";
    await user.save();
    res.status(201).json({ msg: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    // Check if password is correct
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ jwt: token, expiry: 3600 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Secure key for generating JWT Access Tokens
// Ideally in .env but for the sake of simplicity :D
const JWT_SECRET = 'SECretPP2001'; 

// Middleware to authenticate tokens
function authenticateToken(req, res, nextFunction) {
  const jwtToken = req.header("x-auth-token");

  // No token error
  if (!jwtToken) {
    return res.status(401)
      .json({msg: "Token is not attached." });
  }

  try {
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    //decode the userId and proceed to the execute the function
    req.user = decoded;
    nextFunction();
  } catch (error) {
    res.status(401).json({msg: "Token is not valid." });
  }
}

// Show User Data
router.get("/user", authenticateToken, async (req, res) => {
  try {
    //find user by Id acquired for jwt token
    const user = await User.findById(req.user.userId);
    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrow money if purchasing power is enough
router.post("/borrow", authenticateToken, async (req, res) => {
  try {
    const { amount, tenure } = req.body;
    //find user by Id acquired for jwt token
    const user = await User.findById(req.user.userId);
    const interestRate = 0.08;
    const monthlyRepayment = (amount * (1 + interestRate)) / tenure;

    // Check if user is approved
    if (user.status !== "approved") {
      res.status(400).json({ msg: "User is not approved." });
    }

    // Check if user has enough purchase power
    if (user.purchasePower < amount) {
      return res
        .status(400)
        .json({ msg: "User does not have enough purchase power." });
    }

    // Deduct the amount from purchase power
    user.purchasePower -= amount;
    await user.save();
    res.json({ purchasePower: user.purchasePower, monthlyRepayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  };
});

module.exports = router;
