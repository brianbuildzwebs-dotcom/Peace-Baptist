export function extractEmbedSrc(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch) return srcMatch[1].trim().replace(/\s+/g, '');

  return trimmed.replace(/\s+/g, '');
}

export function parseSimpleStreamzEmbed(input) {
  const src = extractEmbedSrc(input);
  if (!src) return null;

  const match = src.match(/^(https?:\/\/[^/]+)\/embed\/c\/([^/?#]+)/i);
  if (!match) return null;

  return {
    embedBase: match[1],
    channelId: match[2],
    embedUrl: src,
  };
}

export function isIframeEmbedUrl(value) {
  const src = extractEmbedSrc(value);
  return /^https?:\/\//i.test(src);
}