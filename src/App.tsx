import "./App.css";
import { AuthProvider } from "./lib/auth";
import { useAuth } from "./lib/useAuth";
import { useState, useEffect } from "react";
import PostList from "./components/PostList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreatePost } from "./lib/queries";

// Main content component shown after authentication
function Dashboard() {
  const { user, signOut } = useAuth();
  const [postText, setPostText] = useState("");

  const createPost = useCreatePost();

  // Console log to help debug user metadata
  console.log("User:", user);

  // Check for all possible username keys in metadata
  const getUserName = () => {
    if (!user?.user_metadata) return user?.email?.split("@")[0] ?? "User";

    // Try different possible keys for username
    return (
      user.user_metadata.user_name ??
      user.user_metadata.username ??
      user.user_metadata.name ??
      user?.email?.split("@")[0] ??
      "User"
    );
  };

  const displayName = getUserName();

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
      <header className="twitter-header">
        <div className="header-content">
          <h1>
            <img src="/logo.png" alt="Bleater Logo" className="twitter-logo" />
            Bleater
          </h1>
          <div className="user-info">
            <div className="user-profile">
              {user?.email &&
                (user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={`@${displayName}'s profile`}
                    className="header-avatar-img"
                  />
                ) : (
                  <div className="header-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                ))}
              <span className="username">@{displayName}</span>
            </div>
            <button
              className="signout-button"
              onClick={signOut}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="post-creation">
          <div className="profile-picture">
            {user?.email &&
              (user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={`@${displayName}'s profile`}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              ))}
          </div>
          <form className="post-form" onSubmit={handlePostSubmit}>
            <textarea
              placeholder="What's happening???"
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
  const { user, loading, signInWithGitHub, autoLogin } = useAuth();

  useEffect(() => {
    if (!loading && !user && autoLogin()) {
      // Auto-login if enabled
      signInWithGitHub();
    }
  }, [loading, user, signInWithGitHub, autoLogin]);

  if (loading || !user) {
    return (
      <div className="loading-container">
        {!autoLogin() ? (
          <div className="login-container">
            <img src="/logo.png" alt="Bleater Logo" className="loading-logo" />
            <h2>Welcome to Bleater</h2>
            <button className="login-button" onClick={() => signInWithGitHub()}>
              Sign in with GitHub
            </button>
          </div>
        ) : (
          <img src="/logo.png" alt="Bleater Logo" className="loading-logo" />
        )}
      </div>
    );
  }

  return <Dashboard />;
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
