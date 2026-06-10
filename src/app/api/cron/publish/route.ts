import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/crypto';

export async function GET(request: Request) {
  // Authorize Cron Job using Header Token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'local-cron-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();

  try {
    // 1. Fetch pending posts scheduled for now or earlier
    const posts = await prisma.scheduledPost.findMany({
      where: {
        status: 'PENDING',
        scheduledTime: { lte: now },
        attempts: { lt: 3 }
      },
      include: {
        clientAccount: true
      }
    });

    if (posts.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending posts to publish.' });
    }

    // 2. Lock the posts by changing status to PUBLISHING
    const postIds = posts.map(p => p.id);
    await prisma.scheduledPost.updateMany({
      where: { id: { in: postIds } },
      data: { status: 'PUBLISHING' }
    });

    // 3. Process each post asynchronously
    const publishPromises = posts.map(async (post) => {
      try {
        const account = post.clientAccount;
        
        let token = 'mock-access-token';
        if (account.encryptedToken && account.tokenIv && account.tokenTag) {
          try {
            token = decryptToken(account.encryptedToken, account.tokenIv, account.tokenTag);
          } catch (decryptErr) {
            console.error(`Decryption failed for account token of post ${post.id}:`, decryptErr);
            throw new Error('Failed to decrypt OAuth access token.');
          }
        }

        // Mock publishing logic based on platform
        if (post.platform === 'YOUTUBE') {
          await mockPublishToYoutube(post.mediaUrl, post.caption, token);
        } else if (post.platform === 'INSTAGRAM') {
          await mockPublishToInstagram(post.mediaUrl, post.caption, token);
        } else if (post.platform === 'TIKTOK') {
          await mockPublishToTiktok(post.mediaUrl, post.caption, token);
        } else if (post.platform === 'FACEBOOK') {
          await mockPublishToFacebook(post.mediaUrl, post.caption, token);
        } else {
          throw new Error(`Unsupported platform: ${post.platform}`);
        }

        // Mark as published
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            attempts: { increment: 1 }
          }
        });
      } catch (err: any) {
        console.error(`Error publishing post ${post.id}:`, err);
        const nextAttempts = post.attempts + 1;
        
        // If attempts are 3 or more, mark as failed permanently. Otherwise, set back to PENDING to retry next hour.
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: nextAttempts >= 3 ? 'FAILED' : 'PENDING',
            attempts: nextAttempts,
            errorMessage: err.message || String(err)
          }
        });
      }
    });

    // Wait for all publishes to finish
    await Promise.allSettled(publishPromises);

    return NextResponse.json({
      success: true,
      message: `Processed ${posts.length} scheduled posts.`
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Server error processing cron job' }, { status: 500 });
  }
}

// Mock platform publishing integrations
async function mockPublishToYoutube(mediaUrl: string, caption: string, token: string) {
  console.log(`[YouTube Publish] Posting ${mediaUrl} with caption: "${caption}" using token: ${token.substring(0, 10)}...`);
  // Artificial network latency
  await new Promise(resolve => setTimeout(resolve, 800));
}

async function mockPublishToInstagram(mediaUrl: string, caption: string, token: string) {
  console.log(`[Instagram Publish] Posting ${mediaUrl} with caption: "${caption}" using token: ${token.substring(0, 10)}...`);
  await new Promise(resolve => setTimeout(resolve, 800));
}

async function mockPublishToTiktok(mediaUrl: string, caption: string, token: string) {
  console.log(`[TikTok Publish] Posting ${mediaUrl} with caption: "${caption}" using token: ${token.substring(0, 10)}...`);
  await new Promise(resolve => setTimeout(resolve, 800));
}

async function mockPublishToFacebook(mediaUrl: string, caption: string, token: string) {
  console.log(`[Facebook Publish] Posting ${mediaUrl} with caption: "${caption}" using token: ${token.substring(0, 10)}...`);
  await new Promise(resolve => setTimeout(resolve, 800));
}
