import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, token } = body;

    if (!platform || !token) {
      return NextResponse.json({ error: 'Platform and token are required' }, { status: 400 });
    }

    // 1. Get or create a default user and client account to link the credentials
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Demo Admin',
          email: 'admin@demo.com',
          passwordHash: 'mock-hash',
          role: 'ADMIN',
        }
      });
    }

    let account = await prisma.clientAccount.findFirst({
      where: { employeeId: user.id }
    });
    if (!account) {
      account = await prisma.clientAccount.create({
        data: {
          name: 'Default Client Account',
          employeeId: user.id
        }
      });
    }

    // 2. Encrypt the mock token using AES-256-GCM
    const encryptedData = encryptToken(token);

    // 3. Save to database
    await prisma.clientAccount.update({
      where: { id: account.id },
      data: {
        encryptedToken: encryptedData.encrypted,
        tokenIv: encryptedData.iv,
        tokenTag: encryptedData.tag,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days expiry
      }
    });

    console.log(`[Mock OAuth] Connected ${platform} with encrypted token stored successfully.`);

    return NextResponse.json({
      success: true,
      message: `${platform} connected successfully with encrypted credentials stored in database.`
    });
  } catch (error: any) {
    console.error('Mock OAuth connection failed:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
