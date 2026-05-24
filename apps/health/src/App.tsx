import { useState } from "react";
import { OnboardingWizard } from "./features/onboarding/OnboardingWizard";
import { Dashboard } from "./features/dashboard/Dashboard";
import { WeeklyCheckInForm } from "./features/checkIn/WeeklyCheckInForm";
import { useCheckInsStore } from "./store/checkIns";
import { useProfileStore } from "./store/profile";

type View = "dashboard" | "check-in";

export default function App() {
  const profile = useProfileStore((s) => s.profile);
  const latest = useCheckInsStore((s) => s.checkIns[0] ?? null);

  const [view, setView] = useState<View>("dashboard");

  if (!profile) {
    return <OnboardingWizard />;
  }

  if (view === "check-in") {
    return <WeeklyCheckInForm previous={latest} onClose={() => setView("dashboard")} />;
  }

  return <Dashboard onStartCheckIn={() => setView("check-in")} />;
}
