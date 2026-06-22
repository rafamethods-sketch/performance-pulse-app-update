import { Dumbbell } from "lucide-react";
import { navItems, type SheetId, type UserRole } from "@/lib/data";

type SidebarProps = {
  activeSheet: SheetId;
  onSheetChange: (sheet: SheetId) => void;
  role: UserRole;
};

export function Sidebar({ activeSheet, onSheetChange, role }: SidebarProps) {
  return (
    <aside className="hidden h-screen w-72 overflow-y-auto border-r border-line bg-panel/85 px-5 py-6 lg:block">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-gradient-to-br from-steel to-moss text-white">
          <Dumbbell size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">Rafa Methods</p>
          <p className="text-xs text-ink/60">
            {role === "coach" ? "Cuenta entrenador" : "Cuenta deportista"}
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems
          .filter((item) => role === "coach" || !["planning", "progressions", "routines"].includes(item.id ?? ""))
          .map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSheet;
          const label = role === "athlete" && item.id === "training" ? "Mi entrenamiento" : item.label;
          return (
            <button
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                isActive
                  ? "bg-gradient-to-r from-steel to-moss text-white shadow-soft"
                  : "text-ink/70 hover:bg-white hover:text-ink"
              }`}
              key={item.label}
              onClick={() => item.id && onSheetChange(item.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
