import { csrfController } from "../controllers/auth/csrf.controller.mjs";
import express from "express";
import { shareController } from "../controllers/share/share.controller.mjs";
import { userVerificationMiddleware } from "../middlewares/user.verification.middleware.mjs";

export const routes = express.Router();

routes.post("/post/share", userVerificationMiddleware, shareController);

routes.get("/auth/csrf-token", csrfController);
