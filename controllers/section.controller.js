import { httpError } from "../helpers/httpError.js";
import { slugifyChars } from "../helpers/slugify.js";
import {
  createSectionValidation,
  updateSectionValidation,
} from "../helpers/validation.js";
import { Section } from "../models/section.model.js";

const create = async (req, res, next) => {
  const { error } = createSectionValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { _id } = req.user;
  const { title, description } = req.body;
  const checkSection = await Section.findOne({ title });
  if (checkSection) {
    return next(httpError(409, "Section already exists"));
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
    return next(httpError(500));
  }

  return res.status(201).json({
    message: "Section created successfully",
    data: section,
  });
};

const index = async (req, res, next) => {
  const { _id } = req.user;
  const { page, limit } = req.query;
  const sections = await Section.find({
    author: _id,
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  if (!sections) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Sections fetched successfully",
    data: sections,
  });
};

const show = async (req, res, next) => {
  const { sectionSlug } = req.params;
  const section = await Section.findOne({
    slug: sectionSlug,
  });
  if (!section) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Section fetched successfully",
    data: section,
  });
};

const update = async (req, res, next) => {
  const { sectionId } = req.params;

  const { error } = updateSectionValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { title, description } = req.body;
  const updatedSection = await Section.findByIdAndUpdate(
    sectionId,
    { title, description },
    { new: true }
  );
  if (!updatedSection) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Section updated successfully",
    data: updatedSection,
  });
};

const destroy = async (req, res, next) => {
  const { sectionId } = req.params;
  const deletedSection = await Section.findByIdAndDelete(sectionId);
  if (!deletedSection) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Section deleted successfully",
    data: deletedSection,
  });
};

export { create, index, show, update, destroy };
