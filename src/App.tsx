import "./App.css";
import AuthForm from "./components/AuthForm";
import { AuthProvider } from "./lib/auth";
import { useAuth } from "./lib/useAuth";
import { useState } from "react";
import PostList from "./components/PostList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreatePost } from "./lib/queries";

// Main content component shown after authentication
function Dashboard() {
  const { user, signOut } = useAuth();
  const [postText, setPostText] = useState("");

  const createPost = useCreatePost();

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postText.trim() && user) {
      try {
        await createPost.mutateAsync({
          message: postText.trim(),
          userId: user.id,
        });

        console.log("Post saved successfully");
        setPostText(""); // Clear the input after posting
      } catch (error) {
        console.error("Error saving post:", error);
        alert("Failed to save your post. Please try again.");
      }
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Bleater Dashboard</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      </header>
      <main>
        <div className="post-creation">
          <div className="profile-picture">
            {user?.email &&
              (user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={`${user.email}'s profile`}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              ))}
          </div>
          <form className="post-form" onSubmit={handlePostSubmit}>
            <textarea
              placeholder="What's happening?"
              aria-label="Create a new post"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              onKeyDown={(e) => {
                // Submit on Enter (but not when Alt/Shift/Ctrl is pressed)
                if (
                  e.key === "Enter" &&
                  !e.altKey &&
                  !e.shiftKey &&
                  !e.ctrlKey
                ) {
                  e.preventDefault();
                  if (postText.trim() && !createPost.isPending) {
                    handlePostSubmit(e);
                  }
                }
              }}
              maxLength={280}
            ></textarea>
            <div className="post-actions">
              <span className="char-count">
                {postText.length}/280
                <span className="keyboard-hint">
                  Press Enter to post, Shift+Enter for line break
                </span>
              </span>
              <button
                type="submit"
                disabled={!postText.trim() || createPost.isPending}
              >
                {createPost.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
        <div className="posts-container">
          <h2>Recent Bleats</h2>
          <PostList />
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Dashboard /> : <AuthForm />;
}

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
