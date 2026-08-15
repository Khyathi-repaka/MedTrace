export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-night-base text-night-text font-sans selection:bg-cyan/30">
      {children}
    </div>
  );
}
