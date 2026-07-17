import { Dumbbell, Menu } from "lucide-react";
import { coachMainNavIds, navItems, type SheetId, type UserRole } from "@/lib/data";

type SidebarProps = {
  activeSheet: SheetId;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSheetChange: (sheet: SheetId) => void;
  role: UserRole;
};

export function Sidebar({ activeSheet, collapsed, onSheetChange, onToggleCollapsed, role }: SidebarProps) {
  return (
    <aside
      className={`hidden h-screen shrink-0 overflow-y-auto border-r border-line bg-panel/85 py-6 transition-[width,padding] duration-200 lg:block ${
        collapsed ? "w-20 px-3" : "w-72 px-5"
      }`}
    >
      <div className={`flex items-center ${collapsed ? "flex-col justify-center gap-3" : "justify-between gap-3"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <div className="grid size-10 place-items-center rounded-md bg-gradient-to-br from-steel to-moss text-white">
          <Dumbbell size={20} />
        </div>
        <div className={collapsed ? "sr-only" : ""}>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">Rafa Methods</p>
          <p className="text-xs text-ink/60">
            {role === "coach" ? "Cuenta entrenador" : "Cuenta deportista"}
          </p>
        </div>
        </div>
        <button
          aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
          className="grid size-10 place-items-center rounded-md border border-line bg-white text-ink/70 transition hover:text-ink"
          onClick={onToggleCollapsed}
          title={collapsed ? "Expandir menu" : "Colapsar menu"}
          type="button"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems
          .filter((item) => role === "coach" ? coachMainNavIds.includes(item.id as SheetId) : !["planning", "progressions", "routines"].includes(item.id ?? ""))
          .map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSheet;
          const label = role === "athlete" && item.id === "training" ? "Mi entrenamiento" : item.label;
          return (
            <button
              aria-label={label}
              className={`flex w-full items-center rounded-md py-2.5 text-left text-sm transition ${
                isActive
                  ? "bg-gradient-to-r from-steel to-moss text-white shadow-soft"
                  : "text-ink/70 hover:bg-white hover:text-ink"
              } ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
              key={item.label}
              onClick={() => item.id && onSheetChange(item.id)}
              title={collapsed ? label : undefined}
              type="button"
            >
              <Icon size={18} />
              <span className={collapsed ? "sr-only" : ""}>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
