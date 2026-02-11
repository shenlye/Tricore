import type { InferRequestType, InferResponseType } from "hono/client";
import type { client } from "@/lib/api";

export type PostResponse = InferResponseType<typeof client.api.v1.posts.$get>;
export type Post = Extract<PostResponse, { data: any }>["data"][number];

export type CreatePostData = InferRequestType<typeof client.api.v1.posts.$post>["json"];
export type UpdatePostData = InferRequestType<typeof client.api.v1.posts[":id"]["$patch"]>["json"];

export interface PostFormData {
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
}
