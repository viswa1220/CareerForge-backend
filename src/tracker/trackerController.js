import prisma from "../config/prisma.js";

/* ==========================================================
   ➕ CREATE APPLICATION
   ========================================================== */
export const createApplication = async (req, res) => {
  try {
    const { company, position, status, appliedDate, resumeId } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!company || !position || !resumeId) {
      return res
        .status(400)
        .json({ message: "Company, position, and resumeId are required" });
    }

    // Verify the resume belongs to this user
    const resume = await prisma.resume.findFirst({
      where: { id: Number(resumeId), userId },
    });
    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or doesn't belong to user" });
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        company,
        position,
        status: status || "Applied",
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        resumeId: Number(resumeId),
        userId,
      },
      include: {
        resume: { select: { id: true, title: true, template: true } },
      },
    });

    res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==========================================================
   📋 GET ALL APPLICATIONS FOR LOGGED-IN USER
   ========================================================== */
export const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resume: { select: { id: true, title: true, template: true } },
      },
    });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==========================================================
   ✏️ UPDATE APPLICATION
   ========================================================== */
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, status } = req.body;
    const userId = req.user.id;

    // Check if this record belongs to the user
    const existing = await prisma.application.findFirst({
      where: { id: Number(id), userId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        company: company || existing.company,
        position: position || existing.position,
        status: status || existing.status,
      },
    });

    res.json({
      message: "Application updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==========================================================
   ❌ DELETE APPLICATION
   ========================================================== */
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.application.findFirst({
      where: { id: Number(id), userId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    await prisma.application.delete({ where: { id: existing.id } });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: "Server error" });
  }
};
