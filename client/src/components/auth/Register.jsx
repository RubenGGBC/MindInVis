import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const Register = ({ onSwitchToLogin, onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un correo electrónico válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear confirm password error when passwords match
    if (name === 'confirmPassword' && value === formData.password) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Call onLogin with the name
      onLogin(formData.name);
    }, 500);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'strength-weak';
    if (passwordStrength <= 2) return 'strength-medium';
    if (passwordStrength <= 3) return 'strength-good';
    return 'strength-strong';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Débil';
    if (passwordStrength <= 2) return 'Media';
    if (passwordStrength <= 3) return 'Buena';
    return 'Fuerte';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <img src="/src/utils/logo.png" alt="MindInVis" />
            </div>
            <span className="auth-logo-text">MindInVis</span>
          </div>
          <h1 className="auth-title">Crea tu cuenta</h1>
          <p className="auth-subtitle">Comienza a crear mapas mentales increíbles</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre completo
            </label>
            <div className={`input-wrapper ${errors.name ? 'error' : ''}`}>
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Juan Pérez"
              />
            </div>
            {errors.name && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`strength-bar ${i < passwordStrength ? getStrengthColor() : ''}`}
                    />
                  ))}
                </div>
                {passwordStrength > 0 && (
                  <span className={`strength-text ${getStrengthColor()}`}>
                    {getStrengthText()}
                  </span>
                )}
              </div>
            )}
            {errors.password && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <div className={`input-wrapper ${errors.confirmPassword ? 'error' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle size={18} className="success-icon" />
              )}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <p className="auth-footer">
            ¿Ya tienes una cuenta?{' '}
            <button type="button" className="link-button" onClick={onSwitchToLogin}>
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
