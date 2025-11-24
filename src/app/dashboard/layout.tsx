import { LogoutButton } from "./_components";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Logout button - Fixed position with container padding */}
      <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none">
        <div className="container mx-auto px-4 flex justify-end pointer-events-auto">
          <LogoutButton />
        </div>
      </div>

      {/* Main content */}
      {children}
    </div>
  );
}
