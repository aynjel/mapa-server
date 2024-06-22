import { createSectionValidation } from "../helpers/validation.js";
import { Section } from "../models/section.model.js";

const createSection = async (req, res, next) => {
  const { title, description } = req.body;

  const { error } = createSectionValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const section = await Section.create({ title, description });

  return res.status(201).json({ section });
};

const getSections = async (_req, res) => {
  const sections = await Section.find();

  return res.json({ sections });
};

const getSectionById = async (req, res) => {
  const { id } = req.params;
  const section = await Section.findById(id);

  if (!section) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ section });
};

const updateSection = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const section = await Section.findByIdAndUpdate(
    id,
    { title, description },
    { new: true }
  );

  if (!section) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ section });
};

const deleteSection = async (req, res) => {
  const { id } = req.params;
  const section = await Section.findByIdAndDelete(id);

  if (!section) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ section });
};

export {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
};
