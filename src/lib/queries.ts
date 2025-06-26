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
    // Optimistically update the cache for a better UX
    onMutate: async (newPostData) => {
      // Generate a temporary ID for the optimistic post
      const tempId = `temp-${Date.now()}`;

      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: [queryKeys.posts] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<PostType[]>([
        queryKeys.posts,
      ]);

      // Optimistically update the cache with our new post
      queryClient.setQueryData<PostType[]>([queryKeys.posts], (old = []) => {
        // Create an optimistic post
        const optimisticPost: PostType = {
          id: tempId, // Temporary ID that will be replaced with the real one
          message: newPostData.message,
          user_id: newPostData.userId,
          created_at: new Date().toISOString(),
        };

        // Insert optimistic post at the beginning of the posts array
        return [optimisticPost, ...old];
      });

      // Pre-populate the likes cache for this temporary post ID
      // Set likes count to 0
      queryClient.setQueryData(queryKeys.postLikes(tempId), 0);

      // Set user like status to false (not liked)
      if (newPostData.userId) {
        queryClient.setQueryData(
          queryKeys.userLike(tempId, newPostData.userId),
          false
        );
      }

      // Return context with the previous posts and temp ID
      return { previousPosts, tempId };
    },
    // On error, roll back the optimistic update
    onError: (_error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData([queryKeys.posts], context.previousPosts);
      }

      // Clean up the likes cache for the temporary post ID
      if (context?.tempId) {
        queryClient.removeQueries({
          queryKey: queryKeys.postLikes(context.tempId),
        });
        if (variables.userId) {
          queryClient.removeQueries({
            queryKey: queryKeys.userLike(context.tempId, variables.userId),
          });
        }
      }
    },
    // Handle successful post creation
    onSuccess: (data, variables, context) => {
      // If we have a real post ID now (should be in the data)
      if (data?.[0]?.id && context?.tempId) {
        const realPostId = data[0].id;

        // Set proper likes count for the real post ID
        queryClient.setQueryData(queryKeys.postLikes(realPostId), 0);

        // Set proper user like status for the real post ID
        if (variables.userId) {
          queryClient.setQueryData(
            queryKeys.userLike(realPostId, variables.userId),
            false
          );
        }
      }
    },

    // Always refetch after error or success to ensure data consistency
    onSettled: (_data, _error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });

      // Clean up the temporary likes caches
      if (context?.tempId) {
        queryClient.removeQueries({
          queryKey: queryKeys.postLikes(context.tempId),
        });
        if (variables.userId) {
          queryClient.removeQueries({
            queryKey: queryKeys.userLike(context.tempId, variables.userId),
          });
        }
      }
    },
  });
};

// Fetch post likes count
export const fetchPostLikesCount = async (postId: string) => {
  // If this is a temporary post ID (optimistic update), don't make a network request
  if (postId.startsWith("temp-")) {
    return 0; // Temporary posts always have 0 likes
  }

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

  // If this is a temporary post ID (optimistic update), don't make a network request
  if (postId.startsWith("temp-")) {
    return false; // Temporary posts are never liked initially
  }

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
    // Handle optimistic updates for likes
    onMutate: async ({ postId, userId, liked }) => {
      // If this is a temporary post, just update the cache (no server request)
      if (postId.startsWith("temp-")) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKeys.postLikes(postId),
        });
        await queryClient.cancelQueries({
          queryKey: queryKeys.userLike(postId, userId),
        });

        // Snapshot current values
        const previousLikeCount =
          queryClient.getQueryData<number>(queryKeys.postLikes(postId)) ?? 0;
        const previousUserLike =
          queryClient.getQueryData<boolean>(
            queryKeys.userLike(postId, userId)
          ) ?? false;

        // Update like count optimistically
        const newCount = liked ? previousLikeCount - 1 : previousLikeCount + 1;
        queryClient.setQueryData(queryKeys.postLikes(postId), newCount);

        // Update user like status optimistically
        queryClient.setQueryData(queryKeys.userLike(postId, userId), !liked);

        return {
          previousLikeCount,
          previousUserLike,
          isTemporary: true,
        };
      }

      return { isTemporary: false };
    },
    onError: (_error, { postId, userId }, context) => {
      // Only rollback if it was a temporary post
      if (context?.isTemporary) {
        // Restore previous values
        if (context.previousLikeCount !== undefined) {
          queryClient.setQueryData(
            queryKeys.postLikes(postId),
            context.previousLikeCount
          );
        }

        if (context.previousUserLike !== undefined) {
          queryClient.setQueryData(
            queryKeys.userLike(postId, userId),
            context.previousUserLike
          );
        }
      }
    },
    onSuccess: ({ postId, userId }) => {
      // Only invalidate for real posts (not temporary ones)
      if (!postId.startsWith("temp-")) {
        // Invalidate and refetch likes queries
        queryClient.invalidateQueries({
          queryKey: queryKeys.postLikes(postId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.userLike(postId, userId),
        });
      }
    },
  });
};
