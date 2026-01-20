import type { RefObject } from "react";
import type { Post } from "./types";
import type { MilkdownEditorRef } from "@/components/milkdown-editor";
import { Loader2 } from "lucide-react";
import { MilkdownEditor } from "@/components/milkdown-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContentEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  isLoading: boolean;
  onSave: () => void;
  isSaving: boolean;
  editorRef: RefObject<MilkdownEditorRef | null>;
}

export function ContentEditorDialog({
  open,
  onOpenChange,
  post,
  isLoading,
  onSave,
  isSaving,
  editorRef,
}: ContentEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 w-screen h-dvh !max-w-none m-0 p-0 rounded-none flex flex-col overflow-hidden border-none shadow-none"
      >
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-xl">编辑文章内容</DialogTitle>
            {post && (
              <p className="text-sm text-muted-foreground mt-1">
                正在编辑:
                {" "}
                {post.title || "无标题"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
              取消
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || isLoading}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              保存修改
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-background">
          {isLoading
            ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )
            : post
              ? (
                  <div className="container max-w-5xl mx-auto py-8 px-6">
                    <MilkdownEditor
                      key={post.id}
                      ref={editorRef}
                      defaultValue={post.content || ""}
                    />
                  </div>
                )
              : (
                  <div className="text-center py-24 text-muted-foreground">
                    无法加载文章内容
                  </div>
                )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
