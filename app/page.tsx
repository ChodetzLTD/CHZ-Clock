"use client";

import { useEffect, useRef, useState } from "react";

type Tab = "world" | "alarms" | "sw" | "timer";

export default function ClockApp() {
  const [tab, setTab] = useState<Tab>("world");

  // locale from browser (max languages supported by system)
  const [locale, setLocale] = useState<string>("en-US");

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      setLocale(navigator.language);
    }
  }, []);

  // WORLD CLOCK
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const cities = [
    { name: "Cupertino", tz: "America/Los_Angeles" },
    { name: "New York", tz: "America/New_York" },
    { name: "London", tz: "Europe/London" },
    { name: "Rome", tz: "Europe/Rome" },
    { name: "Tokyo", tz: "Asia/Tokyo" },
    { name: "Sydney", tz: "Australia/Sydney" },
  ];

  // ALARMS
  type Alarm = { time: string; active: boolean };

  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmTime, setAlarmTime] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("alarms");
    if (saved) {
      try {
        setAlarms(JSON.parse(saved));
      } catch {
        setAlarms([]);
      }
    }
  }, []);

  const saveAlarms = (list: Alarm[]) => {
    setAlarms(list);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("alarms", JSON.stringify(list));
    }
  };

  const addAlarm = () => {
    if (!alarmTime) return;
    const updated = [...alarms, { time: alarmTime, active: true }];
    saveAlarms(updated);
    setAlarmTime("");
  };

  const toggleAlarm = (index: number) => {
    const updated = [...alarms];
    updated[index].active = !updated[index].active;
    saveAlarms(updated);
  };

  const deleteAlarm = (index: number) => {
    const updated = alarms.filter((_, i) => i !== index);
    saveAlarms(updated);
  };

  // STOPWATCH
  const [sw, setSw] = useState<number>(0);
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  const startStopwatch = () => {
    if (swRunning) return;
    setSwRunning(true);
    swRef.current = setInterval(() => {
      setSw((t) => t + 10);
    }, 10);
  };

  const stopStopwatch = () => {
    setSwRunning(false);
    if (swRef.current) clearInterval(swRef.current);
  };

  const resetStopwatch = () => {
    stopStopwatch();
    setSw(0);
  };

  // TIMER
  const [timerInput, setTimerInput] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    if (timer <= 0) {
      setTimerRunning(false);
      return;
    }
    const i = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(i);
  }, [timerRunning, timer]);

  const startTimer = () => {
    if (timerInput <= 0) return;
    setTimer(timerInput);
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimer(0);
    setTimerInput(0);
  };

  // simple styles
  const container: React.CSSProperties = {
    padding: "16px",
    paddingBottom: "80px",
    maxWidth: "480px",
    margin: "0 auto",
  };

  const nav: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#111",
    padding: "10px 0",
    borderTop: "1px solid #333",
    fontSize: "13px",
  };

  const navButton = (active: boolean): React.CSSProperties => ({
    color: active ? "#ff9500" : "#aaa",
    border: "none",
    background: "none",
    fontSize: "13px",
  });

  const card: React.CSSProperties = {
    backgroundColor: "#1c1c1e",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 500,
    marginBottom: "12px",
  };

  return (
    <div style={container}>
      {/* World Clock */}
      {tab === "world" && (
        <div>
          <h1 style={sectionTitle}>World Clock</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {cities.map((c) => (
              <div key={c.name} style={card}>
                <span>{c.name}</span>
                <span>
                  {new Intl.DateTimeFormat(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    timeZone: c.tz,
                  }).format(now)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alarms */}
      {tab === "alarms" && (
        <div>
          <h1 style={sectionTitle}>Alarms</h1>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              style={{
                backgroundColor: "#1c1c1e",
                borderRadius: "8px",
                border: "none",
                color: "white",
                padding: "8px",
                flex: 1,
              }}
            />
            <button
              onClick={addAlarm}
              style={{
                backgroundColor: "#ff9500",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "black",
                fontWeight: 500,
              }}
            >
              Add
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alarms.map((a, i) => (
              <div key={i} style={card}>
                <div>
                  <div style={{ fontSize: "24px" }}>{a.time}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    Alarm
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={() => toggleAlarm(i)}
                    style={{
                      backgroundColor: a.active ? "#34c759" : "#3a3a3c",
                      borderRadius: "16px",
                      border: "none",
                      padding: "4px 10px",
                      fontSize: "12px",
                      color: "white",
                    }}
                  >
                    {a.active ? "On" : "Off"}
                  </button>
                  <button
                    onClick={() => deleteAlarm(i)}
                    style={{
                      backgroundColor: "#3a3a3c",
                      borderRadius: "16px",
                      border: "none",
                      padding: "4px 10px",
                      fontSize: "12px",
                      color: "white",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stopwatch */}
      {tab === "sw" && (
        <div style={{ textAlign: "center" }}>
          <h1 style={sectionTitle}>Stopwatch</h1>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {(sw / 1000).toFixed(2)}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={startStopwatch}
              style={{
                backgroundColor: "#34c759",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "black",
                fontWeight: 500,
              }}
            >
              Start
            </button>
            <button
              onClick={stopStopwatch}
              style={{
                backgroundColor: "#ff3b30",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "white",
                fontWeight: 500,
              }}
            >
              Stop
            </button>
            <button
              onClick={resetStopwatch}
              style={{
                backgroundColor: "#3a3a3c",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "white",
                fontWeight: 500,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Timer */}
      {tab === "timer" && (
        <div style={{ textAlign: "center" }}>
          <h1 style={sectionTitle}>Timer</h1>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {timer}s
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              justifyContent: "center",
            }}
          >
            <input
              type="number"
              min={0}
              value={timerInput || ""}
              onChange={(e) => setTimerInput(Number(e.target.value) || 0)}
              placeholder="Seconds"
              style={{
                backgroundColor: "#1c1c1e",
                borderRadius: "8px",
                border: "none",
                color: "white",
                padding: "8px",
                width: "120px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={startTimer}
              style={{
                backgroundColor: "#ff9500",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "black",
                fontWeight: 500,
              }}
            >
              Start
            </button>
            <button
              onClick={stopTimer}
              style={{
                backgroundColor: "#3a3a3c",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "white",
                fontWeight: 500,
              }}
            >
              Stop
            </button>
            <button
              onClick={resetTimer}
              style={{
                backgroundColor: "#3a3a3c",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "white",
                fontWeight: 500,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={nav}>
        <button
          style={navButton(tab === "world")}
          onClick={() => setTab("world")}
        >
          World Clock
        </button>
        <button
          style={navButton(tab === "alarms")}
          onClick={() => setTab("alarms")}
        >
          Alarms
        </button>
        <button
          style={navButton(tab === "sw")}
          onClick={() => setTab("sw")}
        >
          Stopwatch
        </button>
        <button
          style={navButton(tab === "timer")}
          onClick={() => setTab("timer")}
        >
          Timer
        </button>
      </div>
    </div>
  );
}
