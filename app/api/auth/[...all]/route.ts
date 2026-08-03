import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export standard framework handler parameters for Next.js 16.2 App routing
export const { GET, POST } = toNextJsHandler(auth);
