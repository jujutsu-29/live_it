import crypto from "crypto";

export function getYouTubeId(input: string): string {
  try {
    const url = new URL(input);

    // 1. Standard ?v=
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
      return v;
    }

    // 2. youtu.be short link
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // 3. Embed
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.split("/embed/")[1];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // 4. Shorts
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/shorts/")[1];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // 5. Regex fallback
    const match = input.match(/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1] || "";
  } catch {
    // ignore, fallback below
  }

  // 🚨 Last-resort fallback → hash the full input
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}
