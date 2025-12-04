import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login
          onSwitchToRegister={() => setIsLogin(false)}
          onLogin={onLogin}
        />
      ) : (
        <Register
          onSwitchToLogin={() => setIsLogin(true)}
          onLogin={onLogin}
        />
      )}
    </>
  );
};

export default AuthContainer;
