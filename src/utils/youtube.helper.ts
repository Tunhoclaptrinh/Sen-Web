/**
 * Parses various YouTube URL formats and returns a valid embed URL.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw <iframe> tags (handled by caller, but logic provided for safety)
 *
 * @param url - The source YouTube URL or embed tag
 * @returns Valid embed URL or null if invalid
 */
export const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;

  const trimmedUrl = url.trim();

  // If it's already an iframe tag, we don't try to parse it as a URL.
  if (trimmedUrl.startsWith("<iframe")) {
    return null;
  }

  try {
    // Try to parse using browser's URL constructor
    const fullUrl = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`;
    const urlObj = new URL(fullUrl);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname;

    let videoId: string | null = null;

    // 1. Handle youtu.be/ID
    if (host === "youtu.be") {
      videoId = path.substring(1).split(/[?#]/)[0];
    }
    // 2. Handle youtube.com (standard, shorts, embed)
    else if (host.includes("youtube.com")) {
      if (path.includes("/shorts/")) {
        videoId = path.split("/shorts/")[1]?.split(/[?#]/)[0];
      } else if (path.includes("/embed/")) {
        videoId = path.split("/embed/")[1]?.split(/[?#]/)[0];
      } else if (path.includes("/v/")) {
        videoId = path.split("/v/")[1]?.split(/[?#]/)[0];
      } else {
        videoId = urlObj.searchParams.get("v");
      }
    }

    // Final Regex Fallback for common patterns if ID is still null
    if (!videoId) {
      const regexPatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&#\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)([^?&#\s]+)/,
      ];

      for (const pattern of regexPatterns) {
        const match = trimmedUrl.match(pattern);
        if (match && match[1]) {
          videoId = match[1];
          break;
        }
      }
    }

    if (videoId) {
      const cleanId = videoId.split(/[?#]/)[0];
      const finalEmbed = `https://www.youtube.com/embed/${cleanId}`;
      return finalEmbed;
    }

    // Fallback for non-youtube URLs (vimeo, direct mp4, etc.)
    if (trimmedUrl.startsWith("http")) {
      return trimmedUrl;
    }

    return null;
  } catch (e) {
    return null;
  }
};
