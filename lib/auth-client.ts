// Client-side auth helpers
// This file contains type definitions and client-safe utilities

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
}

// No actual auth logic here - all auth operations must go through API routes
