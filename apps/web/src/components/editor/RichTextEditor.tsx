import { useEffect, useRef, useState } from 'react';
import { Button, Input, cn } from '@ai-resume/ui';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2 } from 'lucide-react';
import { sanitizeRichTextHtml } from '@/lib/richtext-sanitize';

interface RichTextEditorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  minHeight = 160,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const isFocusedRef = useRef(false);

  const sync = () => {
    const normalized = sanitizeRichTextHtml(String(editorRef.current?.innerHTML || ''));
    const plain = normalized.replace(/<[^>]*>/g, '').trim();
    setIsEmpty(plain.length === 0);
    if (editorRef.current && editorRef.current.innerHTML !== normalized) {
      editorRef.current.innerHTML = normalized;
    }
    onChange(normalized);
  };

  const run = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    sync();
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isFocusedRef.current) return;
    const next = sanitizeRichTextHtml(String(value || ''));
    if (el.innerHTML !== next) el.innerHTML = next;
    setIsEmpty(next.replace(/<[^>]*>/g, '').trim().length === 0);
  }, [value]);

  return (
    <div className="rounded-xl border border-border bg-accent/40 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background/80">
        <Button type="button" variant="ghost" size="sm" onClick={() => run('bold')}><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('italic')}><Italic className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('underline')}><Underline className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('insertUnorderedList')}><List className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => run('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Input value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="https://..." className="h-8 w-40 text-xs bg-background" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => {
              if (!linkInput.trim()) return;
              run('createLink', linkInput.trim());
              setLinkInput('');
            }}
          >
            <Link2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {isEmpty && (
          <div className="absolute left-3 top-3 right-3 bottom-3 text-sm text-muted-foreground pointer-events-none whitespace-pre-line overflow-y-auto">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={cn('p-3 outline-none max-w-none rich-editor-content')}
          style={{ minHeight }}
          onInput={sync}
          onBlur={sync}
          onFocus={() => { isFocusedRef.current = true; }}
          onBlurCapture={() => { isFocusedRef.current = false; }}
        />
      </div>
    </div>
  );
}
