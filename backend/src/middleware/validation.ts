import Joi from 'joi';
import express from 'express';

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

// Validation middleware factory
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input data',
        details: errors
      });
    }
    
    next();
  };
};

// User registration validation schema
const registrationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 20 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// League creation validation schema
const leagueSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'League name is required',
      'string.max': 'League name cannot exceed 50 characters',
      'any.required': 'League name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  sport: Joi.string()
    .valid('football', 'basketball', 'baseball', 'hockey', 'soccer')
    .required()
    .messages({
      'any.only': 'Sport must be one of: football, basketball, baseball, hockey, soccer',
      'any.required': 'Sport is required'
    }),
  
  isPublic: Joi.boolean()
    .optional()
    .default(false),
  
  settings: Joi.object({
    maxTeams: Joi.number()
      .integer()
      .min(4)
      .max(16)
      .optional()
      .default(10),
    
    rosterSize: Joi.number()
      .integer()
      .min(10)
      .max(30)
      .optional()
      .default(16),
    
    draftType: Joi.string()
      .valid('snake', 'auction', 'linear')
      .optional()
      .default('snake'),
    
    waiverSystem: Joi.string()
      .valid('rolling', 'faab', 'reverse_standings')
      .optional()
      .default('rolling'),
    
    budget: Joi.number()
      .min(100)
      .max(1000)
      .optional()
      .default(200)
  }).optional()
});

// Team creation validation schema
const teamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Team name is required',
      'string.max': 'Team name cannot exceed 50 characters',
      'any.required': 'Team name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 200 characters'
    }),
  
  league: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid league ID format',
      'any.required': 'League ID is required'
    })
});

// Player search validation schema
const playerSearchSchema = Joi.object({
  sport: Joi.string()
    .valid('football', 'basketball', 'baseball', 'hockey', 'soccer')
    .optional(),
  
  position: Joi.string()
    .trim()
    .optional(),
  
  team: Joi.string()
    .trim()
    .optional(),
  
  name: Joi.string()
    .trim()
    .optional(),
  
  isActive: Joi.boolean()
    .optional(),
  
  isInjured: Joi.boolean()
    .optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20),
  
  sortBy: Joi.string()
    .valid('name', 'fantasyValue', 'team', 'position')
    .optional()
    .default('fantasyValue'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// MongoDB ObjectId validation
const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Invalid ID format'
  });

// Export validation middleware functions
export const validateRegistration = validate(registrationSchema);
export const validateLogin = validate(loginSchema);
export const validateLeague = validate(leagueSchema);
export const validateTeam = validate(teamSchema);

// Query validation middleware
export const validatePlayerSearch = (req: Request, res: Response, next: NextFunction) => {
  const { error } = playerSearchSchema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your query parameters',
      details: errors
    });
  }
  
  next();
};

// Parameter validation middleware
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = objectIdSchema.validate(req.params[paramName]);
    
    if (error) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};
