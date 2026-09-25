import { AuthButton } from "@/app/auth/components/auth-button";
import { ThemeSwitcher } from "@/app/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

const highlights = [
  ["Learn with direction", "Keep your learning goals, resources, and next steps in one calm workspace."],
  ["Get unstuck faster", "Book time with a mentor when you need a second perspective or a clear plan."],
  ["See your progress", "Build momentum with a simple view of the conversations and commitments that matter."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Contour<span className="text-primary">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Suspense fallback={null}>
            <AuthButton />
          </Suspense>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:pt-24">
        <div>
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.24em] text-primary">Contour mini LMS</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Make progress feel <span className="text-primary">possible.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
            A focused learning space for building skills, finding clarity, and getting meaningful support when you need
            it.
          </p>
        </div>
        <div className="relative rounded-[2rem] border border-border bg-card p-8 shadow-2xl shadow-primary/10">
          <p className="text-sm text-muted-foreground">Your learning rhythm</p>
          <div className="mt-8 space-y-5">
            {["Clarify your next goal", "Build a practical learning plan", "Talk it through with a mentor"].map(
              (item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-border bg-muted/60 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-card-foreground">{item}</span>
                </div>
              ),
            )}
          </div>
          <p className="mt-8 text-sm leading-6 text-muted-foreground">
            Small, consistent steps add up to a direction you can trust.
          </p>
        </div>
      </section>
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-8">
          {highlights.map(([title, description]) => (
            <div key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
