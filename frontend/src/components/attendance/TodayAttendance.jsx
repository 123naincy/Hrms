import { useEffect, useRef, useState } from "react";
import {
  getTodayAttendance,
  punchIn,
  punchOut,
} from "../../services/attendance.service";
import { navigate } from "../../utils/navigate";

const WORK_MODES = [
  { value: "OFFICE", label: "Office" },
  { value: "WORK_FROM_HOME", label: "Work from home" },
  { value: "MEETING", label: "Meeting" },
];

function readGps() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser cannot read GPS location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => {
        reject(
          new Error("Allow location access to punch attendance.")
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

function mapsUrl(latitude, longitude) {
  if (latitude == null || longitude == null) return "";
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function workModeLabel(value) {
  return WORK_MODES.find((item) => item.value === value)?.label || "Office";
}

function compressImage(source) {
  const maxWidth = 640;
  const width = source.videoWidth || source.width || 640;
  const height = source.videoHeight || source.height || 480;
  const scale = Math.min(1, maxWidth / width);
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the selfie.");
  }

  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.72);
}

function TodayAttendance({ user, autoStart = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [workMode, setWorkMode] = useState("OFFICE");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selfie, setSelfie] = useState("");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const autoStarted = useRef(false);
  const [now, setNow] = useState(() => new Date());

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getTodayAttendance();

      setData(result);
    } catch (error) {
      console.error("Attendance API Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!autoStart || loading || !data?.canPunchIn || autoStarted.current) {
      return;
    }

    autoStarted.current = true;
    setSelfie("");
    setCameraError("");
    setError("");
    setCameraOpen(true);
  }, [autoStart, loading, data]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!cameraOpen || selfie) {
      if (!cameraOpen) {
        stopCamera();
      }
      return undefined;
    }

    let cancelled = false;

    async function startCamera() {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera is not available in this browser. A live selfie is required to punch in.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (cameraFailure) {
        console.error("Camera Error:", cameraFailure);
        setCameraError("Allow camera access to take a live selfie.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraOpen, selfie]);

  const openPunchCamera = () => {
    setSelfie("");
    setCameraError("");
    setError("");
    setCameraOpen(true);
  };

  const closePunchCamera = () => {
    setCameraOpen(false);
    setSelfie("");
    setCameraError("");
  };

  const captureSelfie = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      setCameraError("Camera is still starting. Wait a moment and capture again.");
      return;
    }

    try {
      setSelfie(compressImage(videoRef.current));
      setCameraError("");
      stopCamera();
    } catch (captureError) {
      setCameraError(captureError.message || "Could not capture the selfie.");
    }
  };

  const handlePunchIn = async () => {
    try {
      setActionLoading(true);
      setError("");

      if (!selfie) {
        throw new Error("Take a selfie before punching in.");
      }

      const gps = await readGps();
      const result = await punchIn({
        workMode,
        selfie,
        ...gps,
      });

      setData(result);
      setCameraOpen(false);
      setSelfie("");

      await loadAttendance();
    } catch (error) {
      console.error("Punch In Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Punch in failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setActionLoading(true);
      setError("");

      const gps = await readGps();
      const result = await punchOut(gps);

      setData(result);

      await loadAttendance();
    } catch (error) {
      console.error("Punch Out Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Punch out failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="attendance-loading">
        <div className="attendance-spinner" />
        <span>Loading attendance...</span>
      </div>
    );
  }

  const canPunchIn = data?.canPunchIn;
  const canPunchOut = data?.canPunchOut;

  const status =
    data?.status?.replaceAll("_", " ") ||
    "NOT PUNCHED";

  const workingHours =
    Number(data?.workingHours || 0).toFixed(2);

  return (
    <div className="attendance-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="attendance-page-header">

        <div>
          <p className="dashboard-eyebrow">
            BHL GROUP • ATTENDANCE
          </p>

          <h1>
            {user?.fullName
              ? `${greeting(now)}, ${user.fullName.split(" ")[0]}`
              : "My Attendance"}
          </h1>

          <p>
            {autoStart && canPunchIn
              ? "Your punch-in is ready. Capture the selfie to mark attendance."
              : canPunchOut
                ? "You are punched in. Punch out when the day ends."
                : "Track your daily attendance and working hours."}
          </p>
        </div>

        <div className="attendance-date-glass">
          <span>Today</span>

          <strong>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>

      </div>

      <section className="punch-card-grid">
        <article className="punch-info-card">
          <span>Today</span>
          <strong>
            {now.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </strong>
          <p>
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </p>
        </article>

        <article className="punch-info-card">
          <span>Week off</span>
          <strong>{data?.weeklyOffLabel || "Sunday"}</strong>
          <p>Your weekly off day</p>
        </article>

        <button
          type="button"
          className="punch-info-card punch-link-card"
          onClick={() => navigate("/my-leave")}
        >
          <span>Leave</span>
          <strong>My leave</strong>
          <p>Apply or check requests</p>
        </button>

        <button
          type="button"
          className="punch-info-card punch-link-card"
          onClick={() => navigate("/profile")}
        >
          <span>Profile</span>
          <strong>{user?.employeeCode || "Account"}</strong>
          <p>View your details</p>
        </button>
      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="attendance-error">
          <span>!</span>
          {error}
        </div>
      )}


      {/* =====================================================
          STATUS + ACTION
      ===================================================== */}

      <div className="attendance-top-grid">

        <div className="attendance-status-card">

          <div className="attendance-status-top">

            <div>
              <span className="attendance-label">
                Today's Status
              </span>

              <h2>
                {status}
              </h2>
            </div>

            <div
              className={`attendance-status-icon ${
                status === "PRESENT"
                  ? "present"
                  : ""
              }`}
            >
              {status === "PRESENT"
                ? "✓"
                : "◷"}
            </div>

          </div>

          <div className="attendance-status-line" />

          <div className="attendance-mini-stats">

            <div>
              <span>Punch In</span>

              <strong>
                {data?.punchIn
                  ? formatTime(data.punchIn)
                  : "--:--"}
              </strong>
            </div>

            <div>
              <span>Punch Out</span>

              <strong>
                {data?.punchOut
                  ? formatTime(data.punchOut)
                  : "--:--"}
              </strong>
            </div>

            <div>
              <span>Working Hours</span>

              <strong>
                {workingHours}h
              </strong>
            </div>

          </div>

        </div>


        {/* Punch action */}

        <div className="attendance-action-card">

          <div className="attendance-action-icon">
            ◷
          </div>

          <div className="attendance-action-content">

            <span>
              Attendance Action
            </span>

            <strong>
              {canPunchIn
                ? "Ready to start your day?"
                : canPunchOut
                ? "Your workday is in progress"
                : "Attendance completed"}
            </strong>

            <p>
              {data?.status === "WEEK_OFF"
                ? `Today is your week off (${data?.weeklyOffLabel || "weekly off"}).`
                : canPunchIn
                ? workMode === "OFFICE"
                  ? "Office punch-in needs a selfie and a location within 2 km of DLF Corporate Greens, Sector 74A, Gurugram."
                  : "A selfie and your GPS location are saved with this punch."
                : canPunchOut
                ? "Punch out from your current GPS location when the day ends."
                : "You have completed today's attendance."}
            </p>

            {data?.weeklyOffLabel && (
              <p className="attendance-weekoff">
                Week off: {data.weeklyOffLabel}
              </p>
            )}

            {(data?.workMode || data?.punchInLocation) && (
              <p className="attendance-weekoff">
                {data?.workMode ? workModeLabel(data.workMode) : ""}
                {data?.punchInLocation
                  ? ` · In ${data.punchInLocation}`
                  : ""}
                {data?.punchOutLocation
                  ? ` · Out ${data.punchOutLocation}`
                  : ""}
              </p>
            )}

            {data?.punchInLatitude != null && (
              <a
                className="attendance-map-link"
                href={mapsUrl(data.punchInLatitude, data.punchInLongitude)}
                target="_blank"
                rel="noreferrer"
              >
                Open punch-in location
              </a>
            )}

            {data?.punchInSelfie && (
              <img
                className="attendance-selfie-thumb"
                src={data.punchInSelfie}
                alt="Punch-in selfie"
              />
            )}

            {canPunchIn && (
              <div className="attendance-mode-row">
                {WORK_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    className={`attendance-mode ${
                      workMode === mode.value ? "active" : ""
                    }`}
                    onClick={() => setWorkMode(mode.value)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}

          </div>

          <div className="attendance-action-buttons">

            {canPunchIn && (
              <button
                type="button"
                className="punch-button punch-in"
                disabled={actionLoading}
                onClick={openPunchCamera}
              >
                {actionLoading
                  ? "Processing..."
                  : "Punch In"}
              </button>
            )}

            {canPunchOut && (
              <button
                type="button"
                className="punch-button punch-out"
                disabled={actionLoading}
                onClick={handlePunchOut}
              >
                {actionLoading
                  ? "Processing..."
                  : "Punch Out"}
              </button>
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          ATTENDANCE STATS
      ===================================================== */}

      <div className="attendance-stat-grid">

        <AttendanceStat
          icon="◷"
          label="Punch In"
          value={
            data?.punchIn
              ? formatTime(data.punchIn)
              : "--:--"
          }
        />

        <AttendanceStat
          icon="◴"
          label="Punch Out"
          value={
            data?.punchOut
              ? formatTime(data.punchOut)
              : "--:--"
          }
        />

        <AttendanceStat
          icon="⌛"
          label="Working Hours"
          value={`${workingHours} hrs`}
        />

        <AttendanceStat
          icon="✓"
          label="Status"
          value={status}
          success={status === "PRESENT"}
        />

      </div>


      {/* =====================================================
          ATTENDANCE DETAILS
      ===================================================== */}

      <div className="attendance-details-card">

        <div className="attendance-card-header">

          <div>
            <h2>Today's Attendance</h2>

            <p>
              Detailed attendance information
            </p>
          </div>

          <span className="attendance-live-badge">
            ● Live
          </span>

        </div>


        <div className="attendance-timeline">

          <TimelineItem
            icon="↗"
            title="Punch In"
            value={
              data?.punchIn
                ? formatTime(data.punchIn)
                : "Not punched in"
            }
            active={Boolean(data?.punchIn)}
          />

          <div className="timeline-line" />

          <TimelineItem
            icon="⌛"
            title="Working"
            value={
              data?.punchIn && !data?.punchOut
                ? `${workingHours} hours`
                : data?.punchOut
                ? `${workingHours} hours completed`
                : "Waiting for punch in"
            }
            active={
              Boolean(data?.punchIn) &&
              !data?.punchOut
            }
          />

          <div className="timeline-line" />

          <TimelineItem
            icon="↙"
            title="Punch Out"
            value={
              data?.punchOut
                ? formatTime(data.punchOut)
                : "Not punched out"
            }
            active={Boolean(data?.punchOut)}
          />

        </div>

      </div>

      {cameraOpen && (
        <div className="selfie-modal-overlay" role="presentation">
          <div
            className="selfie-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="selfie-title"
          >
            <div className="selfie-modal-header">
              <div>
                <p className="dashboard-eyebrow">PUNCH IN</p>
                <h2 id="selfie-title">Take a selfie</h2>
              </div>
              <button
                type="button"
                className="selfie-close"
                onClick={closePunchCamera}
                disabled={actionLoading}
              >
                Close
              </button>
            </div>

            <p className="selfie-note">
              {workMode === "OFFICE"
                ? "Office mode checks that you are within 2 km of DLF Corporate Greens before the punch is saved."
                : `${workModeLabel(workMode)} can be punched from your current location.`}
            </p>

            <div className="selfie-stage">
              {selfie ? (
                <img src={selfie} alt="Captured selfie preview" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted />
              )}
            </div>

            {cameraError && (
              <div className="attendance-error">
                <span>!</span>
                {cameraError}
              </div>
            )}

            {error && (
              <div className="attendance-error">
                <span>!</span>
                {error}
              </div>
            )}

            <div className="selfie-actions">
              {!selfie && (
                <button
                  type="button"
                  className="punch-button punch-in"
                  onClick={captureSelfie}
                  disabled={actionLoading}
                >
                  Capture
                </button>
              )}

              {selfie && (
                <button
                  type="button"
                  className="punch-button punch-in"
                  onClick={handlePunchIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Checking location..." : "Confirm punch in"}
                </button>
              )}

              {selfie && (
                <button
                  type="button"
                  className="punch-button punch-out"
                  onClick={() => setSelfie("")}
                  disabled={actionLoading}
                >
                  Retake
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/* =========================================================
   STAT
========================================================= */

function AttendanceStat({
  icon,
  label,
  value,
  success,
}) {
  return (
    <div className="attendance-stat">

      <div className="attendance-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong
          className={
            success ? "success-text" : ""
          }
        >
          {value}
        </strong>
      </div>

    </div>
  );
}


/* =========================================================
   TIMELINE
========================================================= */

function TimelineItem({
  icon,
  title,
  value,
  active,
}) {
  return (
    <div
      className={`timeline-item ${
        active ? "active" : ""
      }`}
    >

      <div className="timeline-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}


/* =========================================================
   TIME FORMATTER
========================================================= */

function greeting(date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default TodayAttendance;