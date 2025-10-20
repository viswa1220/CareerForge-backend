import express from "express";
import { protect } from "../auth/authMiddleware.js";
import {
  createResume,
  getResumes,
  updateResume,
  deleteResume,
} from "./resumeController.js";

const router = express.Router();

router.use(protect);
router.post("/", createResume);
router.get("/", getResumes);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

export default router;
