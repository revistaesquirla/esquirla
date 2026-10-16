import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Bloque de video para el editor. Se guarda como <div data-video="URL"></div>
 * y la página pública lo convierte en un reproductor seguro.
 */
export const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-video'),
        renderHTML: (attributes: { url?: string | null }) => ({ 'data-video': attributes.url }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-video]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.setAttribute('contenteditable', 'false');
      dom.style.cssText =
        'border:2px dashed #0D0C0B;padding:1rem;margin:1rem 0;font-family:monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;word-break:break-all;';
      dom.textContent = `▶ Video · ${node.attrs.url ?? ''}`;
      return { dom };
    };
  },
});