import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = ({ onSwitchToRegister, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

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

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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

    setTimeout(() => {
      setIsSubmitting(false);
      const name = formData.email.split('@')[0];
      onLogin(name.charAt(0).toUpperCase() + name.slice(1));
    }, 500);
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
          <h1 className="auth-title">Bienvenido de nuevo</h1>
          <p className="auth-subtitle">Inicia sesión para continuar con tus mapas mentales</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{errors.general}</span>
            </div>
          )}

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
            {errors.password && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <p className="auth-footer">
            ¿No tienes una cuenta?{' '}
            <button type="button" className="link-button" onClick={onSwitchToRegister}>
              Regístrate
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;