import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import {
  getUsers,
  getUserById,
  create,
  resendVerifyEmail,
  updateAvatar,
  updateUserSubscription,
  verifyEmail,
} from "../../controllers/user.controller.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();

router.get("/", ctrlWrapper(getUsers));

router.get("/:userId", ctrlWrapper(getUserById));

/* POST: // http://localhost:3000/api/users/create
{
  "name": "John Doe",
  "email": "example@example.com",
  "password": "examplepassword",
}
*/
router.post("/create", ctrlWrapper(create));

/* PATCH: // http://localhost:3000/api/users/
{
    "subscription":"pro"
}
*/
router.patch("/", authenticateToken, ctrlWrapper(updateUserSubscription));

/* PATCH: // http://localhost:3000/api/users/avatars
    form-data
    avatar,file : image
*/
// prettier-ignore
router.patch("/avatars", authenticateToken, upload.single("avatar"), ctrlWrapper(updateAvatar));

/* GET: // http://localhost:3000/api/users/verify/:verificationToken */
router.get("/verify/:verificationToken", ctrlWrapper(verifyEmail));

/* POST: // http://localhost:3000/api/users/verify 
{
  "email": "example@example.com",
}
*/
router.post("/verify", authenticateToken, ctrlWrapper(resendVerifyEmail));

export { router };
