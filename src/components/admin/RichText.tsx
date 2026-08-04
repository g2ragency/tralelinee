"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";

/*
  Editor rich text minimo: grassetto, corsivo, link. Niente titoli, liste o
  altro — la tipografia del case study è definita dal design e un editor più
  permissivo produrrebbe pagine incoerenti.

  L'HTML prodotto finisce in un input hidden e viene sanificato lato server
  nella Server Action: qui non c'è nessuna garanzia di sicurezza.
*/
export function RichText({
  name,
  defaultValue,
  label,
  hint,
  onChange,
}: {
  name: string;
  defaultValue?: string;
  label: string;
  hint?: string;
  /* Se presente, il valore risale al genitore (repeater) invece di finire
     nel FormData con un campo proprio. */
  onChange?: (html: string) => void;
}) {
  const [html, setHtml] = useState(defaultValue ?? "");

  const editor = useEditor({
    immediatelyRender: false, // evita disallineamenti fra server e client
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({ openOnClick: false, autolink: false }),
    ],
    content: defaultValue ?? "",
    onUpdate: ({ editor }) => {
      const nuovo = editor.getHTML();
      setHtml(nuovo);
      onChange?.(nuovo);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] border border-grey px-4 py-3 text-[18px] leading-[1.4] outline-none focus:border-foreground [&_strong]:font-bold [&_a]:underline",
      },
    },
  });

  const attivo = (check: boolean) =>
    `hoverable border px-3 py-1 text-[15px] ${check ? "border-foreground" : "border-grey text-grey"}`;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[16px] text-grey">{label}</span>
      {!onChange && <input type="hidden" name={name} value={html} />}

      {editor && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={attivo(editor.isActive("bold"))}
            aria-pressed={editor.isActive("bold")}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={attivo(editor.isActive("italic"))}
            aria-pressed={editor.isActive("italic")}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => {
              const attuale = editor.getAttributes("link").href as
                | string
                | undefined;
              const url = window.prompt("Indirizzo del link", attuale ?? "");
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
            }}
            className={attivo(editor.isActive("link"))}
            aria-pressed={editor.isActive("link")}
          >
            Link
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
      {hint && <span className="text-[14px] text-grey">{hint}</span>}
    </div>
  );
}
