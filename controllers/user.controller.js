import bcrypt from "bcryptjs";
import gravatar from "gravatar";
import "dotenv/config";
import { User } from "../models/user.model.js";
import {
  createUserValidation,
  emailValidation,
  subscriptionValidation,
} from "../helpers/validation.js";
import { httpError } from "../helpers/httpError.js";
import { slugifyChars } from "../helpers/slugify.js";
import { v4 as uuid4 } from "uuid";
import { sendEmail } from "../helpers/sendEmail.js";

const { PORT, NODE_ENV } = process.env;

// check if the app is running in production or development
const PROD_URL = "https://mapa-server.onrender.com";
const LOCAL_URL = `http://localhost:${PORT}`;

const EmailEndpoint =
  NODE_ENV === "production"
    ? `${PROD_URL}/api/users/verify`
    : `${LOCAL_URL}/api/users/verify`;

const create = async (req, res, next) => {
  // Validation
  const { error } = createUserValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { name, email, password, role = "student" } = req.body;

  // Registration conflict error
  const user = await User.findOne({ email });
  if (user) {
    return next(httpError(409, "Email in Use"));
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // Create a link to the user's avatar with gravatar
  const avatarURL = gravatar.url(email, { s: "500" }, true);

  // Create a verificationToken for the user
  const verificationToken = `${uuid4()}T${
    new Date().getTime() + 1000 * 60 * 60
  }`;

  const newUser = await User.create({
    slug: slugifyChars(name),
    name,
    email,
    hashPassword,
    avatarURL,
    role,
    verificationToken,
  });
  if (!newUser) {
    return next(httpError(500, "Registration error"));
  }

  // Send an email to the user's mail and specify a link to verify the email (/users/verify/:verificationToken) in the message
  await sendEmail({
    to: email,
    subject: "Action Required: Verify Your Email",
    html: `
      <h1>Welcome to our service</h1>
      <p>
        To complete the registration process and have access to all the features of our service, please click the link below to verify your email address:
      </p>
      <p>
       The link will be active for 1 hour.
      </p>
      <a style="display: block; padding: 10px; background-color: #4CAF50; color: white; text-align: center; text-decoration: none;" href="${EmailEndpoint}/${verificationToken}">Verify Email</a>
    `,
  });

  // Registration success response
  return res.status(201).json({
    message: "Registration successful",
    data: {
      name: newUser.name,
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
      role: newUser.role,
      verificationToken: newUser.verificationToken,
    },
  });
};

const updateUserSubscription = async (req, res, next) => {
  const { error } = subscriptionValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { subscription } = req.body;
  const { _id } = req.user;

  const user = await User.findById(_id);
  if (!user) {
    return next(httpError(404, "User not found"));
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  if (!updatedUser) {
    return next(httpError(500, "Subscription update error"));
  }

  return res.status(200).json({
    message: "Subscription updated successfully",
    data: updatedUser,
  });
};

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: oldPath, originalname } = req.file;

  await Jimp.read(oldPath).then((image) => {
    return image.resize(250, 250).quality(60).writeAsync(oldPath);
  });

  const extension = path.extname(originalname);

  const filename = `${_id}${extension}`;
  const newPath = path.join("public", "avatars", filename);
  await fs.rename(oldPath, newPath);

  let avatarURL = path.join("/avatars", filename);
  avatarURL = avatarURL.replace(/\\/g, "/");

  const updatedAvatar = await User.findByIdAndUpdate(_id, { avatarURL });
  if (!updatedAvatar) {
    return next(httpError(500, "Avatar update error"));
  }

  return res.status(200).json({
    message: "Avatar updated successfully",
    data: { avatarURL },
  });
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  const [token, expiry] = verificationToken.split("T");
  const currentTime = new Date().getTime();
  if (currentTime > Number(expiry)) {
    return next(httpError(400, "Verification link has expired"));
  }

  const user = await User.findOne({ verificationToken });
  if (!user) {
    return next(httpError(404, "Verification error"));
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  if (!updatedUser) {
    return next(httpError(500, "Verification error"));
  }

  return res.status(200).json({
    message: "Verification successful",
    data: updatedUser,
  });
};

const resendVerifyEmail = async (req, res, next) => {
  const { error } = emailValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(httpError(404, "User not found"));
  }

  if (user.verify) {
    return next(httpError(400, "Verification has already been passed"));
  }

  const verificationToken = uuid4();
  const verificationTokenWithExpiry = `${verificationToken}T${
    new Date().getTime() + 1000 * 60 * 60
  }`;

  const updatedUser = await User.findByIdAndUpdate(user._id, {
    verificationToken: verificationTokenWithExpiry,
  });
  if (!updatedUser) {
    return next(httpError(500, "Verification error"));
  }

  await sendEmail({
    to: email,
    subject: "Action Required: Verify Your Email",
    html: `
      <h1>Welcome to our service</h1>
      <p>
        To complete the registration process and have access to all the features of our service, please click the link below to verify your email address:
      </p>
      <p>
       The link will be active for 1 hour.
      </p>
      <a style="display: block; padding: 10px; background-color: #4CAF50; color: white; text-align: center; text-decoration: none;" href="${EmailEndpoint}/${verificationTokenWithExpiry}">Verify Email</a>
    `,
  });

  return res.status(200).json({
    message: "Verification email sent",
    data: updatedUser,
  });
};

export {
  create,
  updateUserSubscription,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
};
