type LogoMarkProps = {
  className?: string;
};

const LogoMark = ({ className = '' }: LogoMarkProps) => (
  <svg
    viewBox="0 0 64 64"
    role="img"
    aria-label="Ascent Certus"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="8" width="12" height="48" rx="6" fill="currentColor" opacity="0.9" />
    <rect x="26" y="14" width="12" height="42" rx="6" fill="currentColor" opacity="0.9" />
    <rect x="46" y="24" width="12" height="32" rx="6" fill="currentColor" opacity="0.9" />
    <path
      d="M8 40 C 20 30, 34 24, 56 20"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export default LogoMark;
