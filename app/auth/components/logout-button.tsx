"use client";

import { Button } from "@/lib/ui/button";

export function LogoutButton() {
  const logout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) return;
    window.location.replace("/auth/login");
  };

  return <Button onClick={logout}>Logout</Button>;
}
