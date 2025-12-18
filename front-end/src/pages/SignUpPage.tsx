// ============================================================================
// SignUpPage - User registration page
// ============================================================================

import { SignUp } from "@clerk/clerk-react";

// ============================================================================
// SignUpPage Component
// ============================================================================

export const SignUpPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
        forceRedirectUrl="/"
        appearance={{
          elements: {
            card: "shadow-sm",
          },
        }}
      />
    </div>
  );
};
