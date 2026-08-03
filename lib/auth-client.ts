import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//   // Reference the base root API target route directly
//   baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
// });

export const authClient = createAuthClient({
  // Adding /api/auth forces frontend requests to stay inside the clean directory tree branch
  baseURL: typeof window !== "undefined" ? `${window.location.origin}/api/auth` 
  : "http://localhost:3000/api/auth",
});
// Destructure reactive standard utility hook hooks
export const { useSession, signIn, signUp, signOut } = authClient;
