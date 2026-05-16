import { useState } from 'react';
import axios from 'axios';
import '../styles/auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'https://mern-auth-backend-4mhs.onrender.com',
        formData
      );

      localStorage.setItem('token', response.data.token);
      setMessage('✅ Sign up successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <p>
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </div>
  );
}
