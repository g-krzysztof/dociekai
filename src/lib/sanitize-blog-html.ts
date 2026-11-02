import sanitizeHtml from 'sanitize-html';

/**
 * Blog articles arrive from the CMS as markdown mixed with raw HTML and are
 * rendered with `dangerouslySetInnerHTML`. The CMS is ours, but its output is
 * still input: one compromised editor account would otherwise run script on
 * every reader's page, next to the auth token in localStorage. The page is
 * statically rendered, so this runs on the server and adds nothing to the
 * client bundle.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
  allowedAttributes: {
    '*': ['class', 'id'],
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  transformTags: {
    a: (tagName, attribs) =>
      attribs.target === '_blank'
        ? { tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } }
        : { tagName, attribs },
  },
};

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
