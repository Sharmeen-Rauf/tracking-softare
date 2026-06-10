import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Platform Domain Verification Regexes
const PLATFORM_REGEX = {
  INSTAGRAM: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv|stories)?/i,
  YOUTUBE: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/)?/i,
  TIKTOK: /^(https?:\/\/)?(www\.)?(tiktok\.com)\/(@[a-zA-Z0-9._-]+\/video\/|v\/|t\/)?/i,
  FACEBOOK: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com)\/(watch\?v=|story\.php|photo\.php|permalink\.php)?/i,
};

// Add timeout-supported fetch helper to verify URL existence
async function verifyUrlExists(url: string, platform: string): Promise<{ exists: boolean; reason?: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(id);

    // 1. If definitive 404 Not Found, the post/video does not exist.
    if (response.status === 404) {
      return { exists: false, reason: 'This post or page does not exist (404 Not Found).' };
    }

    // 2. Read the page text to look for platform-specific error indicators
    const text = await response.text();

    if (platform === 'YOUTUBE') {
      const isUnavailable = 
        text.includes('playerErrorMessageRenderer') || 
        text.includes('"playabilityStatus":{"status":"ERROR"') ||
        /<title>\s*-\s*YouTube<\/title>/i.test(text);
      if (isUnavailable) {
        return { exists: false, reason: 'This YouTube video is unavailable or does not exist.' };
      }
    }

    if (platform === 'INSTAGRAM') {
      if (text.includes('Page Not Found') || text.includes("This page isn't available")) {
        return { exists: false, reason: 'This Instagram page or post is not available.' };
      }
    }

    if (platform === 'TIKTOK') {
      // Reject if the response explicitly indicates an invalid/nonexistent item ID
      if (text.includes('"statusCode":100002') || text.includes('"statusMsg":"invalid item id"')) {
        return { exists: false, reason: 'This TikTok video is unavailable or does not exist.' };
      }
    }

    return { exists: true };
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.warn('URL verification timed out, allowing link as fallback.');
      return { exists: true }; // Timeout: bypass to avoid blocking valid submissions
    }
    console.error('URL reachability check failed:', error);
    if (error.code === 'ENOTFOUND') {
      return { exists: false, reason: 'The domain could not be resolved. Please check your link.' };
    }
    return { exists: true }; // Other networking errors: bypass and allow
  }
}

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

    // 3.5. Reachability and Existence check
    const verification = await verifyUrlExists(trimmedUrl, upperPlatform);
    if (!verification.exists) {
      return NextResponse.json(
        { error: verification.reason || 'The submitted link could not be opened or does not exist.' },
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

