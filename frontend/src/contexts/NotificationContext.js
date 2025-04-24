import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  });

  // Mostrar notificación de éxito
  const showSuccess = (message) => {
    setNotification({
      open: true,
      message,
      type: 'success',
    });
  };

  // Mostrar notificación de error
  const showError = (message) => {
    setNotification({
      open: true,
      message,
      type: 'error',
    });
  };

  // Mostrar notificación de advertencia
  const showWarning = (message) => {
    setNotification({
      open: true,
      message,
      type: 'warning',
    });
  };

  // Mostrar notificación informativa
  const showInfo = (message) => {
    setNotification({
      open: true,
      message,
      type: 'info',
    });
  };

  // Cerrar notificación
  const hideNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
