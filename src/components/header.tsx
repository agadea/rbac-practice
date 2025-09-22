"use client";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./toggle-mode";
import { Button } from "./ui/button";

export function Header() {
  const router = useRouter();
  return (
    <div className="fixed top-4 right-4 z-50">
      <nav
        role="navigation"
        aria-label="Primary Actions"
        className="flex items-center gap-3"
      >
        <Button
          variant="link"
          className="px-3 py-1"
          onClick={() => router.push("/signin")}
        >
          Sign In
        </Button>

        <Button
          variant="link"
          className="px-3 py-1"
          onClick={() => router.push("/signup")}
        >
          Sign Up
        </Button>
        <ModeToggle />
      </nav>
    </div>
  );
}
