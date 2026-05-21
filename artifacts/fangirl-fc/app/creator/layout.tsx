/**
 * Isolated layout for the /creator route.
 *
 * Uses fixed inset-0 z-50 to create a full-viewport overlay that visually
 * covers the global Fangirl layout (nav, header, footer) without modifying
 * app/layout.tsx or any other route.  All other routes keep their layout
 * untouched.
 */
export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0b0613]">
      {children}
    </div>
  );
}
