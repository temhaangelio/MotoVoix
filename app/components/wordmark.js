export function Wordmark({ className = "" }) {
  return (
    <span className={`brand-logo inline-flex items-baseline uppercase ${className}`.trim()} aria-label="MOTORVOIX">
      <span className="font-normal">MOTOR</span><strong className="font-bold">VOIX</strong>
    </span>
  );
}
