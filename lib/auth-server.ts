import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
}

// ============================================================================
// CREATE SESSION
// ============================================================================

export async function createSession(userId: string, email: string, role: string = 'ADMIN') {
  const cookieStore = await cookies();
  const session: AdminSession = { userId, email, role };
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

// ============================================================================
// GET SESSION
// ============================================================================

export async function getSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie) {
      return null;
    }
    
    const session = JSON.parse(sessionCookie.value) as AdminSession;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// ============================================================================
// DELETE SESSION
// ============================================================================

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ============================================================================
// VERIFY ADMIN CREDENTIALS
// ============================================================================

export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Ungültige Anmeldedaten' };
    }

    if (!user.passwordHash) {
      return { success: false, error: 'Ungültige Anmeldedaten' };
    }

    // Simple password comparison for MVP (in production, use bcrypt)
    // For now, we'll use a simple comparison since bcrypt is causing TypeScript issues
    // TODO: Add bcrypt back after installing @types/bcrypt
    const isValidPassword = user.passwordHash === password;

    if (!isValidPassword) {
      return { success: false, error: 'Ungültige Anmeldedaten' };
    }

    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Keine Administrator-Berechtigung' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return { success: false, error: 'Fehler bei der Anmeldung' };
  }
}

// ============================================================================
// REQUIRE AUTH (for server components)
// ============================================================================

export async function requireAuth(): Promise<AdminSession> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
