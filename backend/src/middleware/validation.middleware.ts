import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = formatValidationErrors(errors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    // Replace req.body with validated and transformed DTO
    req.body = dto;
    next();
  };
}

function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  errors.forEach((error) => {
    const property = error.property;
    const messages: string[] = [];

    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      const nestedErrors = formatValidationErrors(error.children);
      Object.keys(nestedErrors).forEach((key) => {
        const nestedKey = `${property}.${key}`;
        const nestedMessages = nestedErrors[key];
        if (nestedMessages && nestedMessages.length > 0) {
          formatted[nestedKey] = nestedMessages;
        }
      });
    }

    if (messages.length > 0) {
      formatted[property] = messages;
    }
  });

  return formatted;
}

