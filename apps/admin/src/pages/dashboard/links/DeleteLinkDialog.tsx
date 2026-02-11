import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteLink } from "./hooks/useLinks";

interface DeleteLinkDialogProps {
  linkId: number | null;
  linkTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLinkDialog({
  linkId,
  linkTitle,
  open,
  onOpenChange,
}: DeleteLinkDialogProps) {
  const deleteLink = useDeleteLink();

  const handleDelete = async () => {
    if (!linkId)
      return;
    await deleteLink.mutateAsync(linkId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除友链</DialogTitle>
          <DialogDescription>
            确定要删除友链 "
            {linkTitle}
            " 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLink.isPending}
          >
            {deleteLink.isPending ? "删除中..." : "删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
