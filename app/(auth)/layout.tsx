export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Modern Radial Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops)),#334155_0%,#1e293b_60%,#0f172a_100%]" />
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      {/* Content */}
      <div className="fixed inset-0 z-10 flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}