// ============================================================================
// SignInPage - User login page
// ============================================================================

import { SignIn } from "@clerk/clerk-react";

// ============================================================================
// SignInPage Component
// ============================================================================

export const SignInPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <SignIn
        path="/signin"
        routing="path"
        signUpUrl="/signup"
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
