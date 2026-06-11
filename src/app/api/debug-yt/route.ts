import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://www.youtube.com/watch?v=mOqhhDXUgUo';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const text = await response.text();
    
    return NextResponse.json({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      title: text.match(/<title>(.*?)<\/title>/)?.[1] || null,
      length: text.length,
      includesPlayerError: text.includes('playerErrorMessageRenderer'),
      includesPlayabilityError: text.includes('"playabilityStatus":{"status":"ERROR"'),
      titleRegexMatch: /<title>\s*-\s*YouTube<\/title>/i.test(text),
      sampleHtml: text.substring(0, 2000)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) });
  }
}
