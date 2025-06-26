import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Database } from "./schema";

// Types
export type PostType = Database["public"]["Tables"]["post"]["Row"];
export type ProfileType = Database["public"]["Tables"]["profiles"]["Row"];
export type LikeType = Database["public"]["Tables"]["likes"]["Row"];

// Query keys
export const queryKeys = {
  posts: "posts",
  post: (id: string) => ["post", id],
  profile: (id: string) => ["profile", id],
  likes: "likes",
  postLikes: (postId: string) => ["likes", postId],
  userLike: (postId: string, userId: string) => ["likes", postId, userId],
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

// Fetch post likes count
export const fetchPostLikesCount = async (postId: string) => {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) throw error;
  return count ?? 0;
};

// Use post likes count query hook
export const usePostLikesCount = (postId: string) => {
  return useQuery({
    queryKey: queryKeys.postLikes(postId),
    queryFn: () => fetchPostLikesCount(postId),
    enabled: !!postId,
  });
};

// Check if user has liked a post
export const checkUserLike = async (postId: string, userId: string) => {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

// Use check user like query hook
export const useUserLike = (postId: string, userId: string) => {
  return useQuery({
    queryKey: queryKeys.userLike(postId, userId),
    queryFn: () => checkUserLike(postId, userId),
    enabled: !!postId && !!userId,
  });
};

// Toggle like on a post
export const toggleLike = async ({
  postId,
  userId,
  liked,
}: {
  postId: string;
  userId: string;
  liked: boolean;
}) => {
  if (!userId) throw new Error("User not authenticated");

  if (liked) {
    // Unlike the post
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) throw error;
  } else {
    // Like the post
    const { error } = await supabase
      .from("likes")
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) throw error;
  }

  return { postId, userId };
};

// Use toggle like mutation hook
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: ({ postId, userId }) => {
      // Invalidate and refetch likes queries
      queryClient.invalidateQueries({ queryKey: queryKeys.postLikes(postId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userLike(postId, userId),
      });
    },
  });
};
