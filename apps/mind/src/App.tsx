import { useState } from "react";
import { TodayView } from "./features/today/TodayView";
import { TasksManager } from "./features/tasks/TasksManager";
import { TrendsView } from "./features/trends/TrendsView";

type Tab = "today" | "tasks" | "trends";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "today", label: "Today" },
  { id: "trends", label: "Trends" },
  { id: "tasks", label: "Tasks" }
];

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-xl px-6 py-8">
        <BrandHeader />
        <TabBar value={tab} onChange={setTab} />
        <main className="mt-8 pb-20">
          {tab === "today" && <TodayView />}
          {tab === "tasks" && <TasksManager />}
          {tab === "trends" && <TrendsView />}
        </main>
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
    <header className="flex items-center gap-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
      <span className="font-display text-base font-semibold text-ink">Currant Mind</span>
    </header>
  );
}

function TabBar({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="mt-6 inline-flex rounded-full border border-line bg-surface p-1">
      {TABS.map((t) => {
        const isActive = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium transition " +
              (isActive ? "bg-accent text-white shadow-sm" : "text-muted hover:text-ink")
            }
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
