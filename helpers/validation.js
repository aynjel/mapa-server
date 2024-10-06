import Joi from "joi";

// validation for adding/updating a contact
const contactValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

// validation for updating favorite field
const favoriteValidation = Joi.object({
  favorite: Joi.bool().required(),
});

// validation for creating user
const createUserValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Missing required name field",
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required()
    .messages({
      "any.required": "Missing required email field",
      "string.email": "Invalid email format",
    }),
  password: Joi.string().min(6).max(16).required().messages({
    "any.required": "Missing required password field",
    "string.min": "Password must be at least {#limit} characters long",
    "string.max": "Password cannot be longer than {#limit} characters",
  }),
  role: Joi.string().valid("student", "teacher", "parent", "admin"),
});

// validation for signin
const signInValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required()
    .messages({
      "any.required": "Missing required email field",
      "string.email": "Invalid email format",
    }),
  password: Joi.string().min(6).max(16).required().messages({
    "any.required": "Missing required password field",
    "string.min": "Password must be at least {#limit} characters long",
    "string.max": "Password cannot be longer than {#limit} characters",
  }),
});

const subscriptionValidation = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business"),
});

// validation for email
const emailValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required()
    .messages({
      "any.required": "Missing required email field",
      "string.email": "Invalid email format",
    }),
});

const createSectionValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
});

const updateSectionValidation = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
});

const createPostValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
});

const updatePostValidation = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  content: Joi.string(),
});

const createCommentValidation = Joi.object({
  content: Joi.string().required(),
});

const updateCommentValidation = Joi.object({
  content: Joi.string(),
});

export {
  contactValidation,
  favoriteValidation,
  createUserValidation,
  signInValidation,
  subscriptionValidation,
  emailValidation,
  createSectionValidation,
  updateSectionValidation,
  createPostValidation,
  updatePostValidation,
  createCommentValidation,
  updateCommentValidation,
};
