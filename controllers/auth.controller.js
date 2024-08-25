import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { httpError } from "../helpers/httpError.js";
import { signInValidation } from "../helpers/validation.js";
import { User } from "../models/user.model.js";

const { SECRET_KEY } = process.env;

const login = async (req, res, next) => {
  const { error } = signInValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(httpError(401, "Email or password is wrong"));
  }

  const isMatch = await bcrypt.compare(password, user.hashPassword);
  if (!isMatch) {
    return next(httpError(401, "Email or password is wrong"));
  }

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "24h" });

  const findAndUpdateToken = await User.findByIdAndUpdate(user._id, { token });
  if (!findAndUpdateToken) {
    return next(httpError(401, "Token not found"));
  }

  return res.status(201).json({
    message: "User logged in successfully",
    data: {
      token,
    },
  });
};

const logout = async (req, res, next) => {
  const { _id, email } = req.user;

  const user = await User.findOne({ email });
  if (!user) {
    return next(httpError(401, "Email or password is wrong"));
  }

  // Logout unauthorized error (setting token to empty string will remove token -> will logout)
  const findAndUpdateToken = await User.findByIdAndUpdate(_id, { token: null });
  if (!findAndUpdateToken) {
    return next(httpError(401, "Token not found"));
  }

  // Logout success response
  return res.status(200).json({
    message: "User logged out successfully",
    data: {
      token: null,
    },
  });
};

const currentUser = async (req, res, next) => {
  const { name, email, subscription, role, avatarURL } = req.user;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(httpError(404, "User not found"));
  }

  return res.json({
    message: `Welcome, ${name}`,
    data: {
      name,
      email,
      subscription,
      role,
      avatarURL,
    },
  });
};

export { login, logout, currentUser };
