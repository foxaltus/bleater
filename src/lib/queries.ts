import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Database } from "./schema";

// Types
export type PostType = Database["public"]["Tables"]["post"]["Row"];
export type ProfileType = Database["public"]["Tables"]["profiles"]["Row"];

// Query keys
export const queryKeys = {
  posts: "posts",
  post: (id: string) => ["post", id],
  profile: (id: string) => ["profile", id],
};

// Fetch posts
export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};

// Use posts query hook
export const usePosts = () => {
  return useQuery({
    queryKey: [queryKeys.posts],
    queryFn: fetchPosts,
  });
};

// Fetch profile
export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Use profile query hook
export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
};

// Create post
export const createPost = async ({
  message,
  userId,
}: {
  message: string;
  userId: string;
}) => {
  const { data, error } = await supabase
    .from("post")
    .insert([{ message, user_id: userId }])
    .select();

  if (error) throw error;
  return data;
};

// Use create post mutation hook
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch posts list query
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
    },
  });
};
