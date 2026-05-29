import { useEffect, useState } from "react";

function nextFridayEnd(): Date {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun..5=Fri..6=Sat
  let add = (5 - day + 7) % 7;
  d.setHours(23, 59, 0, 0);
  if (add === 0 && now.getTime() > d.getTime()) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

export function Countdown({ className = "" }: { className?: string }) {
  const [target, setTarget] = useState(nextFridayEnd);
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = diff(target);
      setT(remaining);
      if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        setTarget(nextFridayEnd());
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span className={`tabular-nums text-[#FF4500] ${className}`}>
      {t.days}d {String(t.hours).padStart(2, "0")}h {String(t.minutes).padStart(2, "0")}m {String(t.seconds).padStart(2, "0")}s
    </span>
  );
}
