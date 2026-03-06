/**
 * audioUrlUtils.ts
 * Detects platform type from a URL or iframe embed code,
 * and converts sharing URLs into embeddable ones.
 */

export type AudioPlatform =
  | 'youtube'
  | 'spotify'
  | 'soundcloud'
  | 'zingmp3'
  | 'nhaccuatoi'
  | 'direct'   // raw audio file
  | 'embed';   // raw <iframe> embed code

export interface ParsedAudioSource {
  platform: AudioPlatform;
  embedUrl: string;    // URL to put in <iframe src> or <audio src>
  isIframe: boolean;   // true when we should render an <iframe>
  label: string;       // suggested display label
}

// ─── Detect raw <iframe> embed code ──────────────────────────────────────────
// Matches: src="URL", src='URL', or bare src=URL (no quotes — used by ZingMP3)
const IFRAME_RE = /<iframe[^>]+src=(?:["']([^"']+)["']|([^\s>]+))/i;

export function parseAudioInput(input: string): ParsedAudioSource | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Raw iframe embed code
  const iframeMatch = trimmed.match(IFRAME_RE);
  if (iframeMatch) {
    // Group 1 = quoted src, Group 2 = unquoted src
    let embedUrl = (iframeMatch[1] || iframeMatch[2]).split(/[\s>]/)[0]; // trim any trailing attrs

    // Force start=true for ZingMP3 / NhacCuaToi if found
    if (embedUrl.includes('zingmp3.vn') || embedUrl.includes('nhaccuatoi.vn')) {
      embedUrl = embedUrl.replace('start=false', 'start=true');
      if (!embedUrl.includes('start=')) {
        embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'start=true';
      }
    }

    const platform = detectPlatformFromUrl(embedUrl);
    return { platform, embedUrl, isIframe: true, label: labelForPlatform(platform) };
  }

  // 2. Direct URL — try to convert to embed URL
  try {
    const url = new URL(trimmed);
    return convertUrlToEmbed(url, trimmed);
  } catch {
    return null; // not a valid URL
  }
}

function detectPlatformFromUrl(url: string): AudioPlatform {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/spotify\.com/.test(url)) return 'spotify';
  if (/soundcloud\.com/.test(url)) return 'soundcloud';
  if (/zingmp3\.vn/.test(url)) return 'zingmp3';
  if (/nhaccuatoi\.vn/.test(url)) return 'nhaccuatoi';
  return 'direct';
}

function labelForPlatform(p: AudioPlatform): string {
  const map: Record<AudioPlatform, string> = {
    youtube: 'YouTube',
    spotify: 'Spotify',
    soundcloud: 'SoundCloud',
    zingmp3: 'ZingMP3',
    nhaccuatoi: 'NhacCuaToi',
    direct: 'Audio File',
    embed: 'Embedded',
  };
  return map[p];
}

function convertUrlToEmbed(url: URL, raw: string): ParsedAudioSource {
  const host = url.hostname.replace(/^www\./, '');

  // ── YouTube ──────────────────────────────────────────────────────────────
  if (host === 'youtube.com' || host === 'youtu.be') {
    let videoId = url.searchParams.get('v');
    if (!videoId) {
      // https://youtu.be/VIDEO_ID or /embed/VIDEO_ID
      videoId = url.pathname.split('/').filter(Boolean).pop() || null;
    }
    if (videoId && videoId.length === 11) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1`;
      return { platform: 'youtube', embedUrl, isIframe: true, label: 'YouTube' };
    }
  }

  // ── Spotify ───────────────────────────────────────────────────────────────
  if (host === 'open.spotify.com') {
    // Convert: open.spotify.com/track/ID → open.spotify.com/embed/track/ID
    const embedUrl = raw.replace('open.spotify.com/', 'open.spotify.com/embed/');
    return { platform: 'spotify', embedUrl, isIframe: true, label: 'Spotify' };
  }
  if (host === 'spotify.com') {
    const embedUrl = raw.replace('spotify.com/', 'open.spotify.com/embed/');
    return { platform: 'spotify', embedUrl, isIframe: true, label: 'Spotify' };
  }

  // ── SoundCloud ────────────────────────────────────────────────────────────
  if (host === 'soundcloud.com' || host === 'on.soundcloud.com') {
    const encodedUrl = encodeURIComponent(raw);
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;
    return { platform: 'soundcloud', embedUrl, isIframe: true, label: 'SoundCloud' };
  }

  // ── ZingMP3 ───────────────────────────────────────────────────────────────
  if (host === 'zingmp3.vn') {
    // ZingMP3 doesn't have an official embed — store direct link; user should provide embed code
    return { platform: 'zingmp3', embedUrl: raw, isIframe: false, label: 'ZingMP3 (link)' };
  }

  // ── NhacCuaToi ───────────────────────────────────────────────────────────
  if (host === 'nhaccuatoi.vn') {
    return { platform: 'nhaccuatoi', embedUrl: raw, isIframe: false, label: 'NhacCuaToi (link)' };
  }

  // ── Direct audio file ─────────────────────────────────────────────────────
  const ext = url.pathname.split('.').pop()?.toLowerCase();
  if (['mp3', 'ogg', 'wav', 'flac', 'aac', 'm4a', 'opus'].includes(ext || '')) {
    return { platform: 'direct', embedUrl: raw, isIframe: false, label: 'Audio File' };
  }

  // Fallback — treat as direct and see what happens
  return { platform: 'direct', embedUrl: raw, isIframe: false, label: 'Custom' };
}

// ─── Platform icon/color map ─────────────────────────────────────────────────
export const PLATFORM_META: Record<AudioPlatform, { icon: string; color: string }> = {
  youtube: { icon: '▶', color: '#ff0000' },
  spotify: { icon: '🎵', color: '#1db954' },
  soundcloud: { icon: '☁', color: '#ff5500' },
  zingmp3: { icon: '🎶', color: '#005eff' },
  nhaccuatoi: { icon: '🎶', color: '#ff6b35' },
  direct: { icon: '🎵', color: '#a8071a' },
  embed: { icon: '📌', color: '#888' },
};
