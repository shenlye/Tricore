import type { Post, PostFormData } from "./types";
import type { MilkdownEditorRef } from "@/components/milkdown-editor";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DashboardLayout from "../layout";
import { ContentEditorDialog } from "./ContentEditorDialog";
import { DeletePostDialog } from "./DeletePostDialog";
import { EditPostDialog } from "./EditPostDialog";
import { useDeletePost, usePost, usePosts, useUpdatePost } from "./hooks/usePosts";
import { PostsTable } from "./PostsTable";

const POSTS_PER_PAGE = 10;

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [contentEditPost, setContentEditPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    description: "",
    isPublished: false,
  });
  const editorRef = useRef<MilkdownEditorRef>(null);

  const { data, isLoading } = usePosts(page, POSTS_PER_PAGE);
  const totalPages = data?.meta ? Math.ceil(data.meta.total / POSTS_PER_PAGE) : 0;

  const slug = editPost?.slug ?? contentEditPost?.slug ?? undefined;
  const { data: fullPost, isLoading: isLoadingPost } = usePost(slug);

  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  // 当获取到文章详情时，初始化表单数据
  const postData = fullPost?.data;
  if (postData && editPost && formData.title === "" && formData.slug === "") {
    setFormData({
      title: postData.title || "",
      slug: postData.slug || "",
      description: postData.description || "",
      isPublished: postData.isPublished || false,
    });
  }

  const handleEditPost = (post: Post) => {
    setEditPost(post);
  };

  const handleCloseEditDialog = (open: boolean) => {
    if (!open) {
      setEditPost(null);
      setFormData({ title: "", slug: "", description: "", isPublished: false });
    }
  };

  const handleSavePost = () => {
    if (editPost) {
      updateMutation.mutate({
        id: editPost.id,
        values: {
          title: formData.title || undefined,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          isPublished: formData.isPublished,
        },
      }, {
        onSuccess: () => {
          setEditPost(null);
          setFormData({ title: "", slug: "", description: "", isPublished: false });
        },
      });
    }
  };

  const handleEditContent = () => {
    setContentEditPost(editPost);
    setEditPost(null);
  };

  const handleSaveContent = () => {
    if (contentEditPost && editorRef.current) {
      updateMutation.mutate({
        id: contentEditPost.id,
        values: {
          content: editorRef.current.getMarkdown(),
        },
      }, {
        onSuccess: () => {
          setContentEditPost(null);
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        },
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            文章管理
          </h1>
          <Button onClick={() => toast.info("创建文章功能即将推出")}>
            <Plus className="w-4 h-4 mr-2" />
            新建文章
          </Button>
        </div>

        <PostsTable
          posts={data?.data as Post[] | undefined}
          isLoading={isLoading}
          skeletonCount={POSTS_PER_PAGE}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={handleEditPost}
          onDelete={setDeleteId}
        />
      </div>

      <DeletePostDialog
        open={deleteId !== null}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <EditPostDialog
        open={editPost !== null}
        onOpenChange={handleCloseEditDialog}
        post={fullPost?.data as Post | null}
        isLoading={isLoadingPost}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSavePost}
        onEditContent={handleEditContent}
        isSaving={updateMutation.isPending}
      />

      <ContentEditorDialog
        open={contentEditPost !== null}
        onOpenChange={open => !open && setContentEditPost(null)}
        post={fullPost?.data as Post | null}
        isLoading={isLoadingPost}
        onSave={handleSaveContent}
        isSaving={updateMutation.isPending}
        editorRef={editorRef}
      />
    </DashboardLayout>
  );
}
