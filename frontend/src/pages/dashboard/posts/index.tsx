import type { Post, PostFormData } from "./types";
import type { MilkdownEditorRef } from "@/components/milkdown-editor";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "../layout";
import { ContentEditorDialog } from "./ContentEditorDialog";
import { CreatePostDialog } from "./CreatePostDialog";
import { DeletePostDialog } from "./DeletePostDialog";
import { EditPostDialog } from "./EditPostDialog";
import { useCreatePost, useDeletePost, usePostById, usePosts, useUpdatePost } from "./hooks/usePosts";
import { PostsTable } from "./PostsTable";

const POSTS_PER_PAGE = 10;

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [contentEditPost, setContentEditPost] = useState<Post | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const editorRef = useRef<MilkdownEditorRef>(null);

  const { data, isLoading } = usePosts(page, POSTS_PER_PAGE);
  const totalPages = data?.meta ? Math.ceil(data.meta.total / POSTS_PER_PAGE) : 0;

  const postId = editPost?.id ?? contentEditPost?.id ?? undefined;
  const { data: fullPost, isLoading: isLoadingPost } = usePostById(postId);
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const handleEditPost = (post: Post) => {
    setEditPost(post);
  };

  const handleCloseEditDialog = (open: boolean) => {
    if (!open) {
      setEditPost(null);
    }
  };

  const handleCreatePost = (values: any) => {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      title: values.title || undefined,
      description: values.description || undefined,
    };
    createMutation.mutate(payload, {
      onSuccess: (response) => {
        setIsCreateDialogOpen(false);
        // 创建成功后，自动打开内容编辑器
        if (response.data) {
          setContentEditPost(response.data as Post);
        }
      },
    });
  };

  const handleSavePost = (values: PostFormData) => {
    if (editPost) {
      updateMutation.mutate({
        id: editPost.id,
        values: {
          title: values.title || undefined,
          slug: values.slug || undefined,
          description: values.description || undefined,
          isPublished: values.isPublished,
        },
      }, {
        onSuccess: () => {
          setEditPost(null);
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
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

      <CreatePostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreatePost}
        isSaving={createMutation.isPending}
      />

      {editPost && (
        <EditPostDialog
          open={true}
          onOpenChange={handleCloseEditDialog}
          post={fullPost?.data as Post | null}
          isLoading={isLoadingPost}
          onSave={handleSavePost}
          onEditContent={handleEditContent}
          isSaving={updateMutation.isPending}
        />
      )}

      {contentEditPost && (
        <ContentEditorDialog
          open={true}
          onOpenChange={open => !open && setContentEditPost(null)}
          post={fullPost?.data as Post | null}
          isLoading={isLoadingPost}
          onSave={handleSaveContent}
          isSaving={updateMutation.isPending}
          editorRef={editorRef}
        />
      )}
    </DashboardLayout>
  );
}
