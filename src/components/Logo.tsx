interface Props {
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ className, withWordmark = true }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M22 12c-5 0-9 4-9 9 0 1.5.4 3 1.1 4.2-2 1.5-3.1 3.8-3.1 6.3 0 2.6 1.2 4.9 3.1 6.4C13.4 39.1 13 40.5 13 42c0 5 4 9 9 9 1.6 0 3.2-.5 4.5-1.3.7 3 3.4 5.3 6.5 5.3s5.8-2.3 6.5-5.3c1.3.8 2.9 1.3 4.5 1.3 5 0 9-4 9-9 0-1.5-.4-2.9-1.1-4.1 1.9-1.5 3.1-3.8 3.1-6.4 0-2.5-1.1-4.8-3.1-6.3.7-1.2 1.1-2.7 1.1-4.2 0-5-4-9-9-9-1.6 0-3.2.5-4.5 1.3C38.8 10.3 36.1 8 33 8s-5.8 2.3-6.5 5.3C25.2 12.5 23.6 12 22 12z" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M12 32h6l3-6 5 12 4-9 3 5h19" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {withWordmark && <span className="font-semibold tracking-tight">SentimentScope</span>}
    </div>
  );
}
