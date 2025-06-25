import "./App.css";
import AuthForm from "./components/AuthForm";
import { AuthProvider } from "./lib/auth";
import { useAuth } from "./lib/useAuth";
import { useState } from "react";
import { supabase } from "./lib/supabase";
import PostList from "./components/PostList";

// Main content component shown after authentication
function Dashboard() {
  const { user, signOut } = useAuth();
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postText.trim() && user) {
      try {
        setIsPosting(true);
        const { data, error } = await supabase
          .from("post")
          .insert([
            {
              message: postText.trim(),
              user_id: user.id,
            },
          ])
          .select();

        if (error) {
          throw error;
        }

        console.log("Post saved successfully:", data);
        setPostText(""); // Clear the input after posting
      } catch (error) {
        console.error("Error saving post:", error);
        alert("Failed to save your post. Please try again.");
      } finally {
        setIsPosting(false);
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
              maxLength={280}
            ></textarea>
            <div className="post-actions">
              <span className="char-count">{postText.length}/280</span>
              <button type="submit" disabled={!postText.trim() || isPosting}>
                {isPosting ? "Posting..." : "Post"}
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
