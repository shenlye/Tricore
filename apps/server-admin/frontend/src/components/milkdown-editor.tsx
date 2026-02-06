import type { RefObject } from "react";
import { Crepe } from "@milkdown/crepe";
import { useEffect, useImperativeHandle, useRef } from "react";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame-dark.css";

interface MilkdownEditorProps {
  defaultValue?: string;
  readonly?: boolean;
  // react19 可以把 ref 写到 props 里
  ref?: RefObject<MilkdownEditorRef | null>;
}

export interface MilkdownEditorRef {
  getMarkdown: () => string;
}

export function MilkdownEditor({ ref, defaultValue = "", readonly = false }: MilkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Crepe | null>(null);

  useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      return editorRef.current?.getMarkdown() ?? "";
    },
  }));

  useEffect(() => {
    if (!rootRef.current)
      return;

    const crepe = new Crepe({
      root: rootRef.current,
      defaultValue,
    });

    editorRef.current = crepe;

    crepe.create().then(() => {
      if (readonly) {
        crepe.setReadonly(true);
      }
    });

    return () => {
      crepe.destroy();
    };
  }, [defaultValue, readonly]);

  return (
    <div className="milkdown-editor-wrapper">
      <div ref={rootRef} />
    </div>
  );
}

MilkdownEditor.displayName = "MilkdownEditor";
