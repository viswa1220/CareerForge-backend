import express from "express";
import { protect } from "../auth/authMiddleware.js";
import {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} from "./trackerController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.post("/", createApplication);
router.get("/", getApplications);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
