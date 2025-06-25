import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Post from "./Post";
import type { Database } from "../lib/schema";

type PostType = Database["public"]["Tables"]["post"]["Row"];

export default function PostList() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("post")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh posts manually
  const refreshPosts = () => {
    setLoading(true);
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="loading-posts">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="no-posts">No posts yet. Be the first to post!</div>;
  }

  return (
    <div>
      <div className="posts-header">
        <button
          onClick={refreshPosts}
          className="refresh-button"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Posts"}
        </button>
      </div>
      <div className="posts-list">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
