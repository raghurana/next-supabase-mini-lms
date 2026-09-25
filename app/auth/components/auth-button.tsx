import Link from "next/link";
import { Button } from "@/lib/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/app/auth/components/logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="default" variant={"outline"} className="text-sm">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="default" variant={"default"} className="text-sm">
        <Link href="/auth/signup">Sign up</Link>
      </Button>
    </div>
  );
}
