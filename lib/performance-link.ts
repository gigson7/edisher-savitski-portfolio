export const PERFORMANCE_LINK_URL_MAX = 2048;
export const PERFORMANCE_LINK_TITLE_MAX = 80;

type LinkPair = { linkUrl: string; linkTitle: string } | { linkUrl: null; linkTitle: null };
type LinkResult = { values: LinkPair | undefined; error?: never } | { error: string; values?: never };

function hasUnsupportedCharacters(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0)!;
    if (code < 32 || (code >= 127 && code <= 159) || (code >= 0xd800 && code <= 0xdfff)) return true;
  }
  return false;
}

export function validatePerformanceLink(rawUrl: string, rawTitle: string): LinkResult {
  const linkUrl = rawUrl.trim();
  const linkTitle = rawTitle.trim();

  if (!linkUrl && !linkTitle) return { values: { linkUrl: null, linkTitle: null } };
  if (!linkUrl || !linkTitle) return { error: "Enter both a link URL and a link title, or leave both blank." };
  if (linkTitle.length > PERFORMANCE_LINK_TITLE_MAX || hasUnsupportedCharacters(linkTitle)) {
    return { error: "Enter a link title of up to 80 characters on one line." };
  }

  if (
    linkUrl.length <= PERFORMANCE_LINK_URL_MAX &&
    /^https:\/\/[^/?#]/i.test(linkUrl) &&
    !linkUrl.includes(" ") &&
    !linkUrl.includes("\\") &&
    !hasUnsupportedCharacters(linkUrl)
  ) {
    try {
      const url = new URL(linkUrl);
      if (url.protocol === "https:" && url.hostname && !url.username && !url.password && url.href.length <= PERFORMANCE_LINK_URL_MAX) {
        return { values: { linkUrl: url.href, linkTitle } };
      }
    } catch {
      // Return the same validation message for an unparseable URL.
    }
  }
  return { error: "Enter a valid HTTPS link URL (up to 2,048 characters)." };
}

export function readPerformanceLinkFields(formData: FormData): LinkResult {
  const urls = formData.getAll("linkUrl");
  const titles = formData.getAll("linkTitle");
  if (!urls.length && !titles.length) return { values: undefined };
  if (urls.length !== 1 || titles.length !== 1 || typeof urls[0] !== "string" || typeof titles[0] !== "string") {
    return { error: "Enter one link URL and one link title." };
  }
  return validatePerformanceLink(urls[0], titles[0]);
}
