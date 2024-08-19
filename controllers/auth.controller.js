import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { httpError } from "../helpers/httpError.js";
import { signinValidation } from "../helpers/validation.js";
import { User } from "../models/user.model.js";

const { SECRET_KEY } = process.env;

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = signinValidation.validate(req.body);
  if (error) {
    return httpError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (!user) {
    return httpError(401, "Email or password is wrong");
  }
  const isMatch = await bcrypt.compare(password, user.hashPassword);
  if (!isMatch) {
    return httpError(401, "Email or password is wrong");
  }
  const token = jwt.sign(
    {
      id: user._id,
    },
    SECRET_KEY,
    {
      expiresIn: "24h",
    }
  );
  await User.findByIdAndUpdate(user._id, { token });
  res.status(201).json({
    message: "User logged in succesfully",
    data: {
      token,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  // Logout unauthorized error (setting token to empty string will remove token -> will logout)
  await User.findByIdAndUpdate(_id, { token: null });

  //   Logout success response
  res.status(200).json({
    message: "User logged out succesfully",
    data: {
      token: null,
    },
  });
};

const currentUser = async (req, res) => {
  const { name, email, subscription, role, avatarURL } = req.user;

  res.json({
    message: `Welcom, ${name}`,
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
