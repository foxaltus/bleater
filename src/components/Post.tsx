import { useProfile, type PostType } from "../lib/queries";

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const { data: profile, isLoading } = useProfile(post.user_id);

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

  return (
    <div className="post-item">
      <div className="post-avatar">
        {isLoading ? (
          <div className="avatar-placeholder"></div>
        ) : (
          renderProfileAvatar()
        )}
      </div>
      <div className="post-content">
        <div className="post-header">
          <span className="post-author">{profile?.name || "User"}</span>
          <span className="post-time">{formattedDate}</span>
        </div>
        <div className="post-message">{post.message}</div>
      </div>
    </div>
  );
}
