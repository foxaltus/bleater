import Post from "./Post";
import { usePosts } from "../lib/queries";

export default function PostList() {
  const { data: posts = [], isLoading, isError, error, refetch } = usePosts();

  // Function to refresh posts manually
  const refreshPosts = () => {
    refetch();
  };

  if (isLoading) {
    return <div className="loading-posts">Loading posts...</div>;
  }

  if (isError) {
    return (
      <div className="error-message">
        Failed to load posts. Please try again later.
        {error instanceof Error && `: ${error.message}`}
      </div>
    );
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
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh Posts"}
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
