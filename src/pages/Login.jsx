import { useState } from 'react';

export default function Login({ onLogin, darkMode, setDarkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://chatech-backend-2.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en la autenticación');
        return;
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="theme-toggle">
        <button 
          className="theme-toggle-btn" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1>ChatEch</h1>
          <p>AI Assistant para tu tienda</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="login-footer">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <button onClick={() => setIsLogin(false)}>Regístrate</button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setIsLogin(true)}>Inicia sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
