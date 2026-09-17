'use client';

import { useCallback, useRef, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { createUploadTicket } from '@/actions/storage';
import { optimizeImage } from '@/lib/image';
import { uploadWithProgress } from '@/lib/upload';
import { cn } from '@/lib/utils';

export type EditorValue = { html: string; json: string };

export function RichTextEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (value: EditorValue) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noreferrer' } }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Placeholder.configure({ placeholder: 'Escribe el artículo…' }),
    ],
    content: initialHtml || '',
    editorProps: {
      attributes: {
        class: 'prosa min-h-[320px] px-4 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange({ html: instance.getHTML(), json: JSON.stringify(instance.getJSON()) });
    },
  });

  const insertLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Dirección del enlace', previous ?? 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploadError(null);
      setUploading(true);

      try {
        const prepared = await optimizeImage(file);
        const ticket = await createUploadTicket({
          kind: 'gallery',
          fileName: prepared.name,
          fileType: prepared.type,
          fileSize: prepared.size,
        });

        if (!ticket.ok || !ticket.data) {
          setUploadError(ticket.ok ? 'No se pudo preparar la subida.' : ticket.error);
          return;
        }

        await uploadWithProgress({ signedUrl: ticket.data.signedUrl, file: prepared });

        const alt = window.prompt('Describe la imagen (para quien no puede verla)') ?? '';
        editor.chain().focus().setImage({ src: ticket.data.publicUrl, alt }).run();
      } catch {
        setUploadError('La imagen no pudo subirse. Inténtalo de nuevo.');
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="marco grid min-h-[320px] place-items-center">
        <p className="dato text-carbon/50">Cargando editor…</p>
      </div>
    );
  }

  return (
    <div className="marco">
      <div className="flex flex-wrap items-center gap-1 border-b-2 border-carbon p-2">
        <ToolButton editor={editor} label="Título" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton editor={editor} label="Subtítulo" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolButton editor={editor} label="Párrafo" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} />

        <Divider />

        <ToolButton editor={editor} label="Negrita" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton editor={editor} label="Cursiva" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolButton editor={editor} label="Subrayado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />

        <Divider />

        <ToolButton editor={editor} label="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolButton editor={editor} label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton editor={editor} label="Lista num." active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolButton editor={editor} label="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()} />

        <Divider />

        <ToolButton editor={editor} label="Enlace" active={editor.isActive('link')} onClick={insertLink} />
        <ToolButton
          editor={editor}
          label={uploading ? 'Subiendo…' : 'Imagen'}
          onClick={() => fileInputRef.current?.click()}
        />

        <Divider />

        <ToolButton editor={editor} label="Deshacer" onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton editor={editor} label="Rehacer" onClick={() => editor.chain().focus().redo().run()} />
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void insertImage(file);
          event.target.value = '';
        }}
      />

      {uploadError ? (
        <p className="border-t-2 border-rojo-oscuro px-4 py-2 text-xs font-bold text-rojo-oscuro">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
}: {
  editor: Editor;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'border-2 border-transparent px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] transition-colors',
        active ? 'bg-carbon text-paper' : 'hover:border-carbon',
      )}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-carbon/25" aria-hidden="true" />;
}
