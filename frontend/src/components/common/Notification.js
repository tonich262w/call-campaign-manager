import React, { useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { NotificationContext } from '../../contexts/NotificationContext';

const Notification = () => {
  const { notification, hideNotification } = useContext(NotificationContext);

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification.type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;