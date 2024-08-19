import { httpError } from "../helpers/httpError.js";
import { slugifyChars } from "../helpers/slugify.js";
import { createSectionValidation } from "../helpers/validation.js";
import { Section } from "../models/section.model.js";

const create = async (req, res) => {
  const { error } = createSectionValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const { _id } = req.user;
  const { title, description } = req.body;
  const checkSection = await Section.findOne({ title });

  if (checkSection) {
    throw httpError(409, "Section already exists");
  }

  const slug = slugifyChars(title);
  const section = await Section.create({
    slug,
    title,
    description,
    author: _id,
    postsCount: 0,
  });

  if (!section) {
    throw httpError(500);
  }

  res.status(201).json({
    message: "Section created successfully",
    data: section,
  });
};

const index = async (req, res) => {
  const { _id } = req.user;
  const { page, limit } = req.query;
  const sections = await Section.find({
    author: _id,
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  if (!sections) {
    throw httpError(404);
  }

  res.status(200).json({
    message: "Sections fetched successfully",
    data: sections,
  });
};

const show = async (req, res) => {
  const { id } = req.params;
  const section = await Section.findById(id);

  if (!section) {
    throw httpError(404);
  }

  res.status(200).json({
    message: "Section fetched successfully",
    data: section,
  });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const section = await Section.findByIdAndUpdate(
    id,
    { title, description },
    { new: true }
  );

  if (!section) {
    throw httpError(404);
  }

  res.status(200).json({
    message: "Section updated successfully",
    data: section,
  });
};

const destroy = async (req, res) => {
  const { id } = req.params;
  const section = await Section.findByIdAndDelete(id);

  if (!section) {
    throw httpError(404);
  }

  res.status(200).json({
    message: "Section deleted successfully",
    data: section,
  });
};

export { create, index, show, update, destroy };
