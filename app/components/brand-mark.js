const SPOKES = [
  { x1: "20", y1: "15.2", x2: "20", y2: "10.4" },
  { x1: "24.565", y1: "18.517", x2: "29.13", y2: "17.033" },
  { x1: "22.821", y1: "23.883", x2: "25.643", y2: "27.767" },
  { x1: "17.179", y1: "23.883", x2: "14.357", y2: "27.767" },
  { x1: "15.435", y1: "18.517", x2: "10.87", y2: "17.033" },
];

export function BrandMark({ className = "", spinning = false }) {
  return (
    <svg
      aria-hidden="true"
      className={`brand-mark ${spinning ? "wheel-spin" : ""} ${className}`.trim()}
      fill="none"
      viewBox="0 0 40 40"
    >
      <circle cx="20" cy="20" r="15.2" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="20" cy="20" r="10.4" stroke="currentColor" strokeWidth="1.1" />
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.25">
        {SPOKES.map((spoke) => (
          <line key={`${spoke.x2}-${spoke.y2}`} {...spoke} />
        ))}
      </g>
      <circle cx="20" cy="20" r="3.05" fill="currentColor" />
    </svg>
  );
}
