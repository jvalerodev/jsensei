import Link from "next/link";
import { LogoutButton } from "../dashboard/_components";

export default function ContentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Header with site name and logout button - Fixed position with container padding */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <Link
              href="/dashboard"
              className="hover:opacity-80 transition-opacity text-4xl font-bold text-blue-600"
            >
              JSensei
            </Link>
            <span className="text-sm text-gray-500 hidden sm:inline italic">
              Tu tutor inteligente de JavaScript
            </span>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Main content with top padding to account for fixed header */}
      <div className="pt-16">{children}</div>
    </div>
  );
}
