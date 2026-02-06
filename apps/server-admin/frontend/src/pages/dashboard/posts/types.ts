export interface PostFormData {
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
  type?: "post" | "memo";
}

export interface CreatePostData extends PostFormData {
  type: "post" | "memo";
  content: string;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  isPublished?: boolean;
  type?: "post" | "memo";
  cover?: string;
  category?: string;
  tags?: string[];
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
