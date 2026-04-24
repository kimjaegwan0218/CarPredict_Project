import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    onLoginSuccess(user);
    navigate('/');
  };

  return (
    <LoginForm
      onLoginSuccess={handleSuccess}
      onMoveSignup={() => navigate('/signup')}
      onBack={() => navigate('/')}
    />
  );
}

export default LoginPage;