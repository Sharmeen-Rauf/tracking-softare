import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initializing Prisma client (in production, you would typically use a global client to prevent multiple instances)
const prisma = new PrismaClient();

// Platform Domain Verification Regexes
const PLATFORM_REGEX = {
  INSTAGRAM: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv|stories)?/i,
  YOUTUBE: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/)?/i,
  TIKTOK: /^(https?:\/\/)?(www\.)?(tiktok\.com)\/(@[a-zA-Z0-9._-]+\/video\/|v\/|t\/)?/i,
  FACEBOOK: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com)\/(watch\?v=|story\.php|photo\.php|permalink\.php)?/i,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, platform, clientAccountId, userId } = body;

    // 1. Missing or Empty Input Validation
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'Submission URL is required.' },
        { status: 400 }
      );
    }

    if (!platform || !clientAccountId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, clientAccountId, and userId are mandatory.' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // 2. Validate Platform Match
    const upperPlatform = platform.toUpperCase() as keyof typeof PLATFORM_REGEX;
    const regex = PLATFORM_REGEX[upperPlatform];
    if (!regex) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}. Allowed platforms are Instagram, YouTube, TikTok, Facebook.` },
        { status: 400 }
      );
    }

    // Check if the URL matches the selected platform's domain format
    if (!regex.test(trimmedUrl)) {
      return NextResponse.json(
        { error: `Invalid format: The submitted URL does not match the standard format for ${platform}.` },
        { status: 400 }
      );
    }

    // 3. Uniqueness Check (Check past/present submissions across all users)
    const existingSubmission = await prisma.submission.findUnique({
      where: { url: trimmedUrl },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'This link has already been submitted.' },
        { status: 400 }
      );
    }

    // 4. Save Submission to Database
    const submission = await prisma.submission.create({
      data: {
        url: trimmedUrl,
        platform: upperPlatform,
        clientAccountId,
        submittedById: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Link submitted successfully!',
        submission,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API submission error:', error);
    return NextResponse.json(
      { error: 'A server error occurred. Please verify your connection and try again.' },
      { status: 500 }
    );
  }
}
