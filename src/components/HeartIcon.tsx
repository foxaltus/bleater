interface HeartIconProps {
  filled?: boolean;
}

export default function HeartIcon({ filled = false }: HeartIconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "rgb(249, 24, 128)" : "none"}
      stroke={filled ? "none" : "#536471"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`heart-icon ${filled ? "filled" : ""}`}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
