import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { httpError } from "../helpers/httpError.js";
import "dotenv/config";
const { SECRET_KEY } = process.env;

const authenticateToken = async (req, _res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(httpError(401));
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(payload.id);
    if (!user || user.token !== token) {
      next(httpError(401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(httpError(401));
  }
};

export { authenticateToken };
