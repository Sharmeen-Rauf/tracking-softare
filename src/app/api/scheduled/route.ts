import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.scheduledPost.findMany({
      orderBy: { scheduledTime: 'desc' },
      include: {
        clientAccount: true,
      }
    });
    return NextResponse.json(posts);
  } catch (err: any) {
    console.error('Failed to get scheduled posts:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mediaUrl, caption, platform, scheduledTime } = body;

    if (!mediaUrl || !caption || !platform || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure we have at least one User and one ClientAccount
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

    const post = await prisma.scheduledPost.create({
      data: {
        mediaUrl,
        caption,
        platform: platform.toUpperCase(),
        scheduledTime: new Date(scheduledTime),
        status: 'PENDING',
        clientAccountId: account.id,
        createdById: user.id
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create scheduled post:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
