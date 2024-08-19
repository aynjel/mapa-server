import express from "express";
import logger from "morgan";
import cors from "cors";
import { router as authRouter } from "./routes/api/auth.route.js";
import { router as usersRouter } from "./routes/api/user.route.js";
import { router as postsRouter } from "./routes/api/post.route.js";
import { router as sectionsRouter } from "./routes/api/section.route.js";

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// tells Express to serve static files from the public directory)
// open http://localhost:3000/avatars/665c98dca10f7f28dc9eb8b2.jpeg on browser
app.use(express.static("public"));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/posts", postsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export { app };
