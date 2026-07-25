const BrandMark = ({ className = "h-8 w-8", compact = false }) => (
  <span
    className={`brand-mark liquid-button-primary liquid-shine inline-flex shrink-0 items-center justify-center rounded-xl text-white ${className}`}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[72%] w-[72%]"
    >
      <path
        d="M15 10.5h14.5L38 19v18.5H15V10.5Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M29.5 10.5V19H38"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M11 17.5H7M11 24H5M11 30.5H7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M19.5 33 24 21l4.5 12M21.25 29h5.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {!compact && <span className="sr-only">ATSmind AI</span>}
  </span>
);

export default BrandMark;
