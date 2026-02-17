import { useEffect, useState } from 'react';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/chat/Chat';
import Home from './pages/landingpage/Home';
import { SignInPage, SignUpPage } from './pages/auth/AuthPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import DisclaimerPage from './pages/legal/DisclaimerPage';
import LegalFooter from './components/LegalFooter';

const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

function App() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const storedLanguage = window.localStorage.getItem('appLanguage');
    return storedLanguage === 'en' || storedLanguage === 'tr' ? storedLanguage : 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('appLanguage', language);
  }, [language]);

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
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
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
      <LegalFooter />
    </BrowserRouter>
  );
}

export default App;
