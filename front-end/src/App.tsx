import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { CharacterProvider } from "@/contexts/CharacterContext";
import { CharacterSheet } from "@/components/character-sheet";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";

// ============================================================================
// Protected Route Component
// ============================================================================

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/signin" replace />
      </SignedOut>
    </>
  );
};

// ============================================================================
// App Component
// ============================================================================

const App = () => {
  return (
    <Routes>
      {/* Authentication Routes - Using splat pattern for Clerk's internal routing */}
      <Route path="/signin/*" element={<SignInPage />} />
      <Route path="/signup/*" element={<SignUpPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CharacterProvider autoSave={true}>
              <CharacterSheet />
            </CharacterProvider>
          </ProtectedRoute>
        }
      />

      {/* Redirect all other paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
