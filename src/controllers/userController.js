const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// JWT secret key - should be in environment variables in production
const userController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, phoneNumber, latitude, longitude } =
        req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [User.sequelize.Op.or]: [{ email: email }, { username: username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        latitude,
        longitude,
      });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Return success response without password
      const userWithoutPassword = { ...user.get() };
      delete userWithoutPassword.password;

      res.status(201).json({
        success: true,
        data: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error registering user",
        error: error.message,
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Return user data without password
      const userWithoutPassword = { ...user.get() };
      delete userWithoutPassword.password;

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging in",
        error: error.message,
      });
    }
  },
};

module.exports = userController;
