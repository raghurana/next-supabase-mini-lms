import { AuthButton } from "@/app/auth/components/auth-button";
import { ThemeSwitcher } from "@/app/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen flex flex-col items-center">
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/dashboard">Contour LMS</Link>
            <Link className="font-normal text-muted-foreground hover:text-foreground" href="/dashboard/consultations">
              Consultations
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Suspense><AuthButton /></Suspense>
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 w-full">
        {children}
      </div>
    </div>
  </main>
);

export default DashboardLayout;
