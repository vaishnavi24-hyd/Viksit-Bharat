import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
