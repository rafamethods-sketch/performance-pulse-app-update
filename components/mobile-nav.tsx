import { Dumbbell } from "lucide-react";
import { navItems, type SheetId, type UserRole } from "@/lib/data";

type MobileNavProps = {
  activeSheet: SheetId;
  onSheetChange: (sheet: SheetId) => void;
  role: UserRole;
};

export function MobileNav({ activeSheet, onSheetChange, role }: MobileNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-panel/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-gradient-to-br from-steel to-moss text-white">
            <Dumbbell size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">Rafa Methods</p>
            <p className="text-xs text-ink/60">
              {role === "coach" ? "Cuenta entrenador" : "Cuenta deportista"}
            </p>
          </div>
        </div>
      </div>
      <nav className="scrollbar-none flex gap-2 overflow-x-auto">
        {navItems
          .filter((item) => role === "coach" || !["planning", "progressions", "routines"].includes(item.id ?? ""))
          .map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSheet;
          return (
            <button
              aria-label={item.label}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition ${
                isActive ? "bg-gradient-to-r from-steel to-moss text-white" : "bg-white text-ink/65"
              }`}
              key={item.label}
              onClick={() => item.id && onSheetChange(item.id)}
              title={item.label}
              type="button"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
