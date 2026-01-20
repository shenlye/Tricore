import type { Post, PostFormData } from "./types";
import { FileText, Loader2 } from "lucide-react";
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
  formData: PostFormData;
  onFormDataChange: (data: PostFormData) => void;
  onSave: () => void;
  onEditContent: () => void;
  isSaving: boolean;
}

export function EditPostDialog({
  open,
  onOpenChange,
  post,
  isLoading,
  formData,
  onFormDataChange,
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

        {isLoading
          ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )
          : post
            ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">标题</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => onFormDataChange({ ...formData, title: e.target.value })}
                      placeholder="文章标题"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={e => onFormDataChange({ ...formData, slug: e.target.value })}
                      placeholder="url-friendly-slug"
                    />
                    <p className="text-xs text-muted-foreground">
                      用于 URL 的唯一标识，只能包含小写字母、数字和连字符
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
                      placeholder="文章的简短描述..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={e => onFormDataChange({ ...formData, isPublished: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isPublished">发布文章</Label>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onEditContent}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    编辑正文内容
                  </Button>
                </div>
              )
            : (
                <div className="text-center py-8 text-muted-foreground">
                  无法加载文章信息
                </div>
              )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || isLoading}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
