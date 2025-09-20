import { ModeToggle } from "./toggle-mode";

export function Header() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <ModeToggle />
    </div>
  );
}
