import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, extractValidationErrors } from '../utils/validation';
import axios from 'axios';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newFieldErrors: Record<string, string[]> = {};

    const emailValidation = validateEmail(form.email);
    if (!emailValidation.isValid) {
      newFieldErrors.email = emailValidation.errors;
    }

    const passwordValidation = validatePassword(form.password, true);
    if (!passwordValidation.isValid) {
      newFieldErrors.password = passwordValidation.errors;
    }

    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleBlur = (field: 'email' | 'password') => {
    if (field === 'email') {
      const validation = validateEmail(form.email);
      setFieldErrors((prev) => ({
        ...prev,
        email: validation.isValid ? [] : validation.errors,
      }));
    } else if (field === 'password') {
      const validation = validatePassword(form.password, true);
      setFieldErrors((prev) => ({
        ...prev,
        password: validation.isValid ? [] : validation.errors,
      }));
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
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const validationErrors = extractValidationErrors(err);
        if (validationErrors) {
          setFieldErrors(validationErrors);
          setErrors({});
        } else {
          // Backend returns { message: "...", error: "..." }
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to login';
          setErrors({ error: [errorMessage] });
        }
      } else {
        setErrors({ error: [err instanceof Error ? err.message : 'Failed to login'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {errors.error && errors.error.length > 0 && (
          <div className="form-error">{errors.error[0]}</div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, email: event.target.value }));
              if (fieldErrors.email) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            }}
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
            onChange={(event) => {
              setForm((prev) => ({ ...prev, password: event.target.value }));
              if (fieldErrors.password) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.password;
                  return newErrors;
                });
              }
            }}
            onBlur={() => handleBlur('password')}
            className={fieldErrors.password && fieldErrors.password.length > 0 ? 'error' : ''}
          />
          {fieldErrors.password && fieldErrors.password.length > 0 && (
            <div className="field-error">{fieldErrors.password[0]}</div>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p>
          No account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

