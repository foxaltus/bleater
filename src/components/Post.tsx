import {
  useProfile,
  usePostLikesCount,
  useUserLike,
  useToggleLike,
  type PostType,
} from "../lib/queries";
import { useAuth } from "../lib/useAuth";
import HeartIcon from "./HeartIcon";

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(post.user_id);
  const { data: likesCount = 0 } = usePostLikesCount(post.id);
  const { data: isLiked = false } = useUserLike(post.id, user?.id ?? "");
  const toggleLikeMutation = useToggleLike();

  // Format the date
  const formattedDate = new Date(post.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Render profile avatar based on available data
  const renderProfileAvatar = () => {
    if (profile?.picture) {
      return (
        <img
          src={profile.picture}
          alt={profile?.name || "User"}
          className="avatar-img"
        />
      );
    } else {
      return <div className="avatar">{profile?.name?.charAt(0) || "U"}</div>;
    }
  };

  const handleLikeToggle = () => {
    if (!user) return; // Only logged in users can like posts

    toggleLikeMutation.mutate({
      postId: post.id,
      userId: user.id,
      liked: isLiked,
    });
  };

  // Check if this is a temporary post (still saving)
  const isSaving = post.id.startsWith('temp-');
  
  return (
    <div className={`post-item ${isSaving ? 'saving' : ''}`}>
      <div className="post-avatar">
        {isLoading ? (
          <div className="avatar-placeholder"></div>
        ) : (
          renderProfileAvatar()
        )}
      </div>
      <div className="post-content">
        <div className="post-header">
          <span className="post-author">@{profile?.name || "User"}</span>
          <span className="post-time">
            {isSaving ? (
              <>
                <span className="saving-indicator">Saving...</span>
              </>
            ) : formattedDate}
          </span>
        </div>
        <div className="post-message">{post.message}</div>
        <div className="post-actions">
          <div className="action-container">
            <button
              className={`like-button ${isLiked ? "liked" : ""}`}
              onClick={handleLikeToggle}
              disabled={!user || toggleLikeMutation.isPending}
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <HeartIcon filled={isLiked} />
              {likesCount > 0 && (
                <span className="like-count">{likesCount}</span>
              )}
            </button>
            {isSaving && <span className="micro-indicator" title="This post is still being saved">⟳</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
