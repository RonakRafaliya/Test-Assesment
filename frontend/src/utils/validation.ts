// Frontend validation utilities

export interface ValidationErrors {
  [key: string]: string[];
}

export interface FieldValidation {
  isValid: boolean;
  errors: string[];
}

// Email validation
export const validateEmail = (email: string): FieldValidation => {
  const errors: string[] = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password validation
export const validatePassword = (password: string, isLogin = false): FieldValidation => {
  const errors: string[] = [];

  if (!password || password.trim() === '') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (!isLogin) {
    // Registration password requirements
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 100) {
      errors.push('Password must not exceed 100 characters');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Name validation
export const validateName = (name: string, fieldName: string): FieldValidation => {
  const errors: string[] = [];

  if (!name || name.trim() === '') {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  if (name.length > 50) {
    errors.push(`${fieldName} must not exceed 50 characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Task title validation
export const validateTaskTitle = (title: string): FieldValidation => {
  const errors: string[] = [];

  if (!title || title.trim() === '') {
    errors.push('Task title is required');
    return { isValid: false, errors };
  }

  if (title.length > 200) {
    errors.push('Task title must not exceed 200 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Task description validation
export const validateTaskDescription = (description: string): FieldValidation => {
  const errors: string[] = [];

  if (description && description.length > 5000) {
    errors.push('Description must not exceed 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Extract validation errors from API response
export const extractValidationErrors = (error: any): ValidationErrors | null => {
  if (error?.validationErrors) {
    return error.validationErrors;
  }
  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  return null;
};

