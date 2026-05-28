const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'div',
]);

function sanitizeHref(value: string): string {
  const href = value.trim();
  if (!href) return '#';
  const lower = href.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return '#';
  return href;
}

export function sanitizeRichTextHtml(input: string): string {
  if (!input) return '';

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return input
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    if (!doc || !doc.body) return '';

    const walk = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (!ALLOWED_TAGS.has(tag)) {
          const parent = el.parentNode;
          if (!parent) return;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
          return;
        }

        [...el.attributes].forEach((attr) => {
          const name = attr.name.toLowerCase();
          if (name.startsWith('on')) {
            el.removeAttribute(attr.name);
            return;
          }
          if (tag === 'a' && name === 'href') {
            el.setAttribute('href', sanitizeHref(attr.value));
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
            return;
          }
          if (name !== 'href' && name !== 'target' && name !== 'rel') {
            el.removeAttribute(attr.name);
          }
        });
      }

      const children = [...node.childNodes];
      for (const child of children) {
        walk(child);
      }
    };

    walk(doc.body);
    return (doc.body.innerHTML || '').trim();
  } catch {
    return String(input || '');
  }
}
