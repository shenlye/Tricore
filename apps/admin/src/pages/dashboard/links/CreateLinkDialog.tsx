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
import { useCreateLink } from "./hooks/useLinks";

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLinkDialog({ open, onOpenChange }: CreateLinkDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    avatar: "",
    desc: "",
    feed: "",
    comment: "",
    category: "",
  });

  const createLink = useCreateLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      avatar: formData.avatar || undefined,
      desc: formData.desc || undefined,
      feed: formData.feed || undefined,
      comment: formData.comment || undefined,
      category: formData.category || undefined,
    };
    await createLink.mutateAsync(data);
    onOpenChange(false);
    setFormData({
      title: "",
      link: "",
      avatar: "",
      desc: "",
      feed: "",
      comment: "",
      category: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加友链</DialogTitle>
            <DialogDescription>
              添加一个新的友情链接到您的网站。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                网站名称
                {" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：我的博客"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link">
                网站链接
                {" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">头像链接</Label>
              <Input
                id="avatar"
                type="url"
                value={formData.avatar}
                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="例如：技术博客"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">描述</Label>
              <Textarea
                id="desc"
                value={formData.desc}
                onChange={e => setFormData({ ...formData, desc: e.target.value })}
                placeholder="网站的简短描述"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feed">RSS Feed</Label>
              <Input
                id="feed"
                type="url"
                value={formData.feed}
                onChange={e => setFormData({ ...formData, feed: e.target.value })}
                placeholder="https://example.com/feed.xml"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">备注</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={e => setFormData({ ...formData, comment: e.target.value })}
                placeholder="内部备注信息"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={createLink.isPending}>
              {createLink.isPending ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
