import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in your environment.');
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={clerkPublishableKey} signInUrl="/login" signUpUrl="/register">
    <StrictMode>
      <App />
    </StrictMode>
  </ClerkProvider>,
);
