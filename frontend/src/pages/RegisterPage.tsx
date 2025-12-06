import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  validateEmail,
  validatePassword,
  validateName,
  extractValidationErrors,
} from '../utils/validation';
import axios from 'axios';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newFieldErrors: Record<string, string[]> = {};

    const firstNameValidation = validateName(form.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      newFieldErrors.firstName = firstNameValidation.errors;
    }

    const lastNameValidation = validateName(form.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      newFieldErrors.lastName = lastNameValidation.errors;
    }

    const emailValidation = validateEmail(form.email);
    if (!emailValidation.isValid) {
      newFieldErrors.email = emailValidation.errors;
    }

    const passwordValidation = validatePassword(form.password, false);
    if (!passwordValidation.isValid) {
      newFieldErrors.password = passwordValidation.errors;
    }

    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleBlur = (field: 'firstName' | 'lastName' | 'email' | 'password') => {
    let validation;
    if (field === 'firstName') {
      validation = validateName(form.firstName, 'First name');
    } else if (field === 'lastName') {
      validation = validateName(form.lastName, 'Last name');
    } else if (field === 'email') {
      validation = validateEmail(form.email);
    } else if (field === 'password') {
      validation = validatePassword(form.password, false);
    }

    if (validation) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: validation.isValid ? [] : validation.errors,
      }));
    }
  };

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const validationErrors = extractValidationErrors(err);
        if (validationErrors) {
          setFieldErrors(validationErrors);
          setErrors({});
        } else {
          // Backend returns { message: "...", error: "..." }
          const errorMessage = err.response?.data?.message || 'Failed to register';
          setErrors({ error: [errorMessage] });
        }
      } else {
        setErrors({ error: [err instanceof Error ? err.message : 'Failed to register'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {errors.error && errors.error.length > 0 && (
          console.log("errors", errors),
          <div className="form-error">{errors.error[0]}</div>
        )}
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            required
            value={form.firstName}
            onChange={(event) => handleFieldChange('firstName', event.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={fieldErrors.firstName && fieldErrors.firstName.length > 0 ? 'error' : ''}
          />
          {fieldErrors.firstName && fieldErrors.firstName.length > 0 && (
            <div className="field-error">{fieldErrors.firstName[0]}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            required
            value={form.lastName}
            onChange={(event) => handleFieldChange('lastName', event.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={fieldErrors.lastName && fieldErrors.lastName.length > 0 ? 'error' : ''}
          />
          {fieldErrors.lastName && fieldErrors.lastName.length > 0 && (
            <div className="field-error">{fieldErrors.lastName[0]}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => handleFieldChange('email', event.target.value)}
            onBlur={() => handleBlur('email')}
            className={fieldErrors.email && fieldErrors.email.length > 0 ? 'error' : ''}
          />
          {fieldErrors.email && fieldErrors.email.length > 0 && (
            <div className="field-error">{fieldErrors.email[0]}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(event) => handleFieldChange('password', event.target.value)}
            onBlur={() => handleBlur('password')}
            className={fieldErrors.password && fieldErrors.password.length > 0 ? 'error' : ''}
          />
          {fieldErrors.password && fieldErrors.password.length > 0 && (
            <div className="field-error">{fieldErrors.password[0]}</div>
          )}
          {!fieldErrors.password && form.password && (
            <div className="field-hint">
              Password must be at least 8 characters with uppercase, lowercase, and a number
            </div>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

