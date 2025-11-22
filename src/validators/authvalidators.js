import { body, validationResult } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name too short"),
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
  body("phone").optional().trim().isMobilePhone("any").withMessage("Invalid phone number"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};