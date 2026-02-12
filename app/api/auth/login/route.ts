import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ApiResponse } from '@/types';

interface AuthResponseData {
  username: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AuthResponseData>>> {
  try {
    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nazwa użytkownika i hasło są wymagane',
          },
        },
        { status: 400 }
      );
    }

    const userRef = doc(db, 'authUsers', username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_INVALID',
            message: 'Nieprawidłowy login lub hasło',
          },
        },
        { status: 401 }
      );
    }

    const userData = userSnap.data();
    if (userData?.password !== password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_INVALID',
            message: 'Nieprawidłowy login lub hasło',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { username },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Nie udało się zalogować',
        },
      },
      { status: 500 }
    );
  }
}
