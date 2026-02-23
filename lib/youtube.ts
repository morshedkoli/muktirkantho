function getParam(value: string, key: string) {
  const params = new URLSearchParams(value);
  return params.get(key);
}

export function extractYouTubeVideoId(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname;

    if (host === "youtu.be") {
      const id = path.slice(1).split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (path === "/watch") {
        return getParam(parsed.search.slice(1), "v");
      }

      if (path.startsWith("/shorts/")) {
        return path.replace("/shorts/", "").split("/")[0] || null;
      }

      if (path.startsWith("/embed/")) {
        return path.replace("/embed/", "").split("/")[0] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url: string) {
  const id = extractYouTubeVideoId(url);
  if (!id) {
    return null;
  }
  return `https://www.youtube.com/embed/${id}`;
}
