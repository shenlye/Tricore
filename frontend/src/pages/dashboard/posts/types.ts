export interface PostFormData {
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
}

export interface CreatePostData extends PostFormData {
  type: "post" | "memo";
  content: string;
}

export interface Post {
  id: number;
  title: string | null;
  slug: string | null;
  description: string | null;
  content: string | null;
  type: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
