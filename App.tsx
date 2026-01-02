import React, { useState, useEffect } from 'react';
import NeurologicalBackground from './components/NeurologicalBackground';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  // Initialize auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('neuro_auth_session');
    return savedAuth === 'active';
  });
  
  const [theme, setTheme] = useState({ hue: 0, brightness: 1 });

  useEffect(() => {
    const updateTheme = () => {
      const h = new Date().getHours();
      // Morning (06-12): Default Cyan (0deg), Brighter
      if (h >= 6 && h < 12) {
        setTheme({ hue: 0, brightness: 1.1 });
      } 
      // Afternoon (12-18): Blue-ish Shift (40deg), Normal Brightness
      else if (h >= 12 && h < 18) {
        setTheme({ hue: 40, brightness: 1.0 });
      } 
      // Evening/Night (18-06): Purple/Deep Shift (80deg), Darker
      else {
        setTheme({ hue: 80, brightness: 0.7 });
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('neuro_auth_session', 'active');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('neuro_auth_session');
    setIsAuthenticated(false);
  };

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      <NeurologicalBackground hue={theme.hue} brightness={theme.brightness} />
      
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;