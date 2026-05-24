import type { HealthState } from "./domain/types";

const EMPTY_STATE: HealthState = {
  profile: null,
  checkIns: [],
  exercises: [],
  sessions: []
};

export default function App() {
  const state = EMPTY_STATE;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem"
      }}
    >
      <div style={{ maxWidth: "32rem", width: "100%" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)"
          }}
        >
          Currant suite
        </p>
        <h1
          style={{
            margin: "0.5rem 0 1.25rem",
            fontFamily: "var(--font-display)",
            fontSize: "2.75rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--accent)"
          }}
        >
          Currant Health
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55 }}>
          Local-first fitness &amp; body tracking. Workouts, weekly check-ins, and
          measurements — same DNA as Currant Cash, separate domain.
        </p>

        <section
          style={{
            marginTop: "2rem",
            padding: "1.25rem 1.5rem",
            background: "var(--accent-soft)",
            borderRadius: "0.75rem"
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: "var(--ink)" }}>
            Scaffold check
          </p>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            Profile: {state.profile ? "loaded" : "not yet onboarded"} · Check-ins:{" "}
            {state.checkIns.length} · Sessions: {state.sessions.length} · Exercises:{" "}
            {state.exercises.length}
          </p>
        </section>
      </div>
    </main>
  );
}
