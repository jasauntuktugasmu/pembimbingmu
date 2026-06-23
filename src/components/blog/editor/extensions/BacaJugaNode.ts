import { Node, mergeAttributes } from "@tiptap/core";

export interface BacaJugaItem {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  excerpt?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bacaJuga: {
      insertBacaJuga: (items: BacaJugaItem[]) => ReturnType;
    };
  }
}

export const BacaJugaNode = Node.create({
  name: "bacaJuga",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [] as BacaJugaItem[],
        parseHTML: (el) => {
          const raw = (el as HTMLElement).getAttribute("data-items");
          if (!raw) return [];
          try { return JSON.parse(decodeURIComponent(raw)); } catch { return []; }
        },
        renderHTML: (attrs) => ({
          "data-items": encodeURIComponent(JSON.stringify(attrs.items || [])),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-baca-juga]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const items: BacaJugaItem[] = (node.attrs.items as BacaJugaItem[]) || [];
    const children: any[] = [
      ["div", { class: "baca-juga-title" }, "Baca Juga"],
      [
        "ul",
        { class: "baca-juga-list" },
        ...items.map((it) => [
          "li",
          {},
          [
            "a",
            { href: `/blog/${it.slug}` },
            it.image ? ["img", { src: it.image, alt: it.title, loading: "lazy" }] : "",
            ["span", {}, it.title],
          ],
        ]),
      ],
    ];
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-baca-juga": "true", class: "baca-juga-block" }),
      ...children,
    ];
  },

  addCommands() {
    return {
      insertBacaJuga:
        (items) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { items } }),
    };
  },
});
