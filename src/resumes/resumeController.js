import prisma from "../config/prisma.js";

// ➕ Create Resume (with related sections)
export const createResume = async (req, res) => {
  try {
    const {
      title,
      summary,
      template,
      colorScheme,
      qualifications,
      skills,
      experiences,
      projects,
      education,
      customSections,
    } = req.body;

    const userId = req.user.id;

    const resume = await prisma.resume.create({
      data: {
        title,
        summary,
        template,
        colorScheme,
        qualifications,
        customSections,
        userId,

        // create nested records for each related section if present
        skills: skills
          ? { create: skills.map((s) => ({ category: s.category, name: s.name })) }
          : undefined,

        experiences: experiences
          ? {
              create: experiences.map((exp) => ({
                jobTitle: exp.jobTitle,
                company: exp.company,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                description: exp.description,
              })),
            }
          : undefined,

        projects: projects
          ? {
              create: projects.map((proj) => ({
                name: proj.name,
                summary: proj.summary,
                techStack: proj.techStack,
                link: proj.link,
              })),
            }
          : undefined,

        education: education
          ? {
              create: education.map((edu) => ({
                degree: edu.degree,
                institution: edu.institution,
                startYear: edu.startYear,
                endYear: edu.endYear,
                grade: edu.grade,
              })),
            }
          : undefined,
      },
      include: {
        skills: true,
        experiences: true,
        projects: true,
        education: true,
      },
    });

    res.status(201).json({ message: "Resume created successfully", resume });
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📋 Get all resumes for the logged-in user (with sections)
export const getResumes = async (req, res) => {
  try {
    const userId = req.user.id;

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        skills: true,
        experiences: true,
        projects: true,
        education: true,
      },
    });

    res.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update Resume
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      title,
      summary,
      template,
      colorScheme,
      qualifications,
      customSections,
    } = req.body;

    const resume = await prisma.resume.updateMany({
      where: { id: Number(id), userId },
      data: { title, summary, template, colorScheme, qualifications, customSections },
    });

    if (!resume.count) return res.status(404).json({ message: "Resume not found" });

    res.json({ message: "Resume updated successfully" });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete Resume (cascade deletes all related entries)
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.skill.deleteMany({ where: { resumeId: Number(id) } });
    await prisma.experience.deleteMany({ where: { resumeId: Number(id) } });
    await prisma.project.deleteMany({ where: { resumeId: Number(id) } });
    await prisma.education.deleteMany({ where: { resumeId: Number(id) } });

    const deleted = await prisma.resume.deleteMany({
      where: { id: Number(id), userId },
    });

    if (!deleted.count) return res.status(404).json({ message: "Resume not found" });

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ message: "Server error" });
  }
};
