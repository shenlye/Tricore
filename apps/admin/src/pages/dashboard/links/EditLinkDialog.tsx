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
import { useLink, useUpdateLink } from "./hooks/useLinks";

interface EditLinkDialogProps {
  linkId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LinkFormData {
  title: string;
  link: string;
  avatar: string;
  desc: string;
  feed: string;
  comment: string;
  category: string;
}

function EditLinkForm({ linkId, linkData, onOpenChange }: {
  linkId: number;
  linkData: { data: LinkFormData } | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const link = linkData?.data;
  const [formData, setFormData] = useState<LinkFormData>({
    title: link?.title || "",
    link: link?.link || "",
    avatar: link?.avatar || "",
    desc: link?.desc || "",
    feed: link?.feed || "",
    comment: link?.comment || "",
    category: link?.category || "",
  });

  const updateLink = useUpdateLink();

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
    await updateLink.mutateAsync({ id: linkId, values: data });
    onOpenChange(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>编辑友链</DialogTitle>
        <DialogDescription>
          修改友链的详细信息。
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-title">
            网站名称
            {" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：我的博客"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-link">
            网站链接
            {" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-link"
            type="url"
            value={formData.link}
            onChange={e => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-avatar">头像链接</Label>
          <Input
            id="edit-avatar"
            type="url"
            value={formData.avatar}
            onChange={e => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-category">分类</Label>
          <Input
            id="edit-category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            placeholder="例如：技术博客"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-desc">描述</Label>
          <Textarea
            id="edit-desc"
            value={formData.desc}
            onChange={e => setFormData({ ...formData, desc: e.target.value })}
            placeholder="网站的简短描述"
            rows={2}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-feed">RSS Feed</Label>
          <Input
            id="edit-feed"
            type="url"
            value={formData.feed}
            onChange={e => setFormData({ ...formData, feed: e.target.value })}
            placeholder="https://example.com/feed.xml"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-comment">备注</Label>
          <Textarea
            id="edit-comment"
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
        <Button type="submit" disabled={updateLink.isPending}>
          {updateLink.isPending ? "保存中..." : "保存"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditLinkDialog({ linkId, open, onOpenChange }: EditLinkDialogProps) {
  const { data: linkData } = useLink(linkId ?? undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {linkId && (
          <EditLinkForm
            key={linkId}
            linkId={linkId}
            linkData={linkData as { data: LinkFormData } | undefined}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
