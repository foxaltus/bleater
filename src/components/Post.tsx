import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/schema";

type PostType = Database["public"]["Tables"]["post"]["Row"];
type ProfileType = Database["public"]["Tables"]["profiles"]["Row"];

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", post.user_id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [post.user_id]);

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
        {loading ? (
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
