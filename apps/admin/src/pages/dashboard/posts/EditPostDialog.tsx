import type { Post, PostFormData } from "./types";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  isLoading: boolean;
  onSave: (data: PostFormData) => void;
  onEditContent: () => void;
  isSaving: boolean;
}

export function EditPostDialog({
  open,
  onOpenChange,
  post,
  isLoading,
  onSave,
  onEditContent,
  isSaving,
}: EditPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑文章信息</DialogTitle>
          <DialogDescription>
            修改文章的基本信息。如需编辑正文内容，请点击"编辑内容"按钮。
          </DialogDescription>
        </DialogHeader>

        {isLoading || !post
          ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )
          : (
              <EditPostForm
                post={post}
                onSave={onSave}
                onEditContent={onEditContent}
                isSaving={isSaving}
                onClose={() => onOpenChange(false)}
              />
            )}
      </DialogContent>
    </Dialog>
  );
}

interface EditPostFormProps {
  post: Post;
  onSave: (data: PostFormData) => void;
  onEditContent: () => void;
  isSaving: boolean;
  onClose: () => void;
}

function EditPostForm({ post, onSave, onEditContent, isSaving, onClose }: EditPostFormProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: post.title || "",
    slug: post.slug || "",
    description: post.description || "",
    isPublished: post.isPublished || false,
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            placeholder="文章标题"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (链接标识)</Label>
          <Input
            id="slug"
            placeholder="example-post-title"
            value={formData.slug}
            onChange={e => setFormData({ ...formData, slug: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="文章的简短描述..."
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isPublished">发布文章</Label>
        </div>
      </div>

      <DialogFooter className="border-t pt-4 mt-4">
        <Button variant="outline" onClick={onEditContent} className="mr-auto" disabled={isSaving}>
          <FileText className="w-4 h-4 mr-2" />
          编辑内容
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={isSaving}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          保存修改
        </Button>
      </DialogFooter>
    </>
  );
}
