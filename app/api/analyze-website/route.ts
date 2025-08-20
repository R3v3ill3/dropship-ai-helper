import { NextRequest, NextResponse } from 'next/server';
import { recommendSegmentsFromWebsite } from '../../../lib/gpt';

function stripHtml(html: string): string {
  try {
    // Remove scripts/styles and tags; collapse whitespace
    const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const withoutTags = withoutScripts.replace(/<[^>]+>/g, ' ');
    const withoutEntities = withoutTags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    return withoutEntities.replace(/\s+/g, ' ').trim();
  } catch {
    return html;
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 12000): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'DropshipAI/1.0 (+analysis)' } });
    if (!res.ok) return null;
    const text = await res.text();
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, availableSegments, locale, topN } = body || {};
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    const normalized = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    let targetUrl: URL;
    try {
      targetUrl = new URL(normalized);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const html = await fetchWithTimeout(targetUrl.toString());
    if (!html) {
      return NextResponse.json({ error: 'Failed to fetch website content' }, { status: 502 });
    }

    const combined = stripHtml(html);
    const truncated = combined.slice(0, 15000);

    const segmentsInput: string[] = Array.isArray(availableSegments) && availableSegments.length > 0
      ? availableSegments.map((s: any) => String(s)).filter(Boolean)
      : [];

    const result = await recommendSegmentsFromWebsite({
      websiteText: truncated,
      availableSegments: segmentsInput,
      locale: typeof locale === 'string' && locale.trim() ? locale : 'Australia',
      topN: typeof topN === 'number' ? topN : 3
    });

    const isLikelyGenericUrl = (pathname: string) => {
      const p = pathname.replace(/\/+$/,'').toLowerCase();
      if (p === '' || p === '/') return true;
      const generic = new Set([
        '/home', '/index', '/collections', '/collection', '/products', '/product', '/shop', '/store', '/catalog', '/category', '/categories', '/about', '/about-us', '/pages/about', '/pages/about-us', '/faq', '/contact'
      ]);
      return generic.has(p);
    };

    const isGenericPage = isLikelyGenericUrl(targetUrl.pathname);

    return NextResponse.json({ success: true, isGenericPage, analyzedUrl: targetUrl.toString(), ...result });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

