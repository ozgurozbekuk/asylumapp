import { useState } from 'react';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/chat/Chat';
import Home from './pages/landingpage/Home';
import { SignInPage, SignUpPage } from './pages/auth/AuthPage';

const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

function App() {
  const [language, setLanguage] = useState('tr');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home language={language} setLanguage={setLanguage} />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat language={language} setLanguage={setLanguage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login/*"
          element={
            <>
              <SignedIn>
                <Navigate to="/" replace />
              </SignedIn>
              <SignedOut>
                <SignInPage language={language} setLanguage={setLanguage} />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/register/*"
          element={
            <>
              <SignedIn>
                <Navigate to="/" replace />
              </SignedIn>
              <SignedOut>
                <SignUpPage language={language} setLanguage={setLanguage} />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
