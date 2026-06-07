import { verifyAdminCredentials, createSession } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    const result = await verifyAdminCredentials(email, password);

    if (result.success && result.user) {
      await createSession(result.user.id, result.user.email, result.user.role);
      return NextResponse.json({ success: true, user: result.user });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Fehler bei der Anmeldung' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler bei der Anmeldung' },
      { status: 500 }
    );
  }
}
