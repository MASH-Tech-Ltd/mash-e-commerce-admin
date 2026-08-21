'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid hsla(var(--accent-primary), 0.2)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          iconTheme: {
            primary: 'hsl(var(--success, 142, 71%, 45%))',
            secondary: 'white',
          },
          style: {
            border: '1px solid hsla(142, 71%, 45%, 0.3)',
            background: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--destructive, 0, 84%, 60%))',
            secondary: 'white',
          },
          style: {
            border: '1px solid hsla(0, 84%, 60%, 0.3)',
            background: '#ffffff',
          },
        },
      }}
    />
  );
}
