import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import * as AuthController from "../../controllers/auth.controller.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";

const router = express.Router();

/* POST: // http://localhost:3000/api/auth/login
{
  "email": "example@example.com",
  "password": "examplepassword"
}
*/
router.post("/login", ctrlWrapper(AuthController.login));

/* GET: // http://localhost:3000/api/auth/logout */
router.get("/logout", authenticateToken, ctrlWrapper(AuthController.logout));

/* GET: // http://localhost:3000/api/auth/current */
router.get(
  "/current",
  authenticateToken,
  ctrlWrapper(AuthController.currentUser)
);

export { router };
