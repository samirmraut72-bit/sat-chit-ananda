"use client";

import { useEffect, useRef, useState } from "react";

export default function ScannerDashboard({
  volunteerName,
  volunteerEmail,
}) {
  const [scannerActive, setScannerActive] =
    useState(false);

  const [scanType, setScanType] = useState("");
  const [scanMessage, setScanMessage] =
    useState("");
  const [popupOpen, setPopupOpen] =
    useState(false);

  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const popupTimerRef = useRef(null);

  function extractQrToken(decodedText) {
    const value = String(decodedText || "").trim();

    if (!value) return "";

    try {
      const url = new URL(value);

      const parts = url.pathname
        .split("/")
        .filter(Boolean);

      if (
        parts[0] === "ticket" &&
        parts[1]
      ) {
        return decodeURIComponent(parts[1]);
      }

      return "";
    } catch {
      if (
        value.length >= 10 &&
        !value.includes("/")
      ) {
        return value;
      }

      const parts = value
        .split("/")
        .filter(Boolean);

      return parts.at(-1) || "";
    }
  }

  function showPopup(type, message) {
    setScanType(type);
    setScanMessage(message);
    setPopupOpen(true);

    if (popupTimerRef.current) {
      window.clearTimeout(
        popupTimerRef.current,
      );
    }

    popupTimerRef.current =
      window.setTimeout(() => {
        setPopupOpen(false);
      }, 2800);

    if (
      typeof navigator !== "undefined" &&
      navigator.vibrate
    ) {
      if (type === "success") {
        navigator.vibrate(120);
      } else {
        navigator.vibrate([
          120,
          80,
          180,
        ]);
      }
    }
  }

  async function handleSuccessfulScan(
    decodedText,
  ) {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      const qrToken =
        extractQrToken(decodedText);

      if (!qrToken) {
        showPopup(
          "error",
          "Invalid QR ticket.",
        );
        return;
      }

      const response = await fetch(
        "/api/admin/scan-check-in",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            qrToken,
          }),
        },
      );

      const result = await response.json();

      if (result.alreadyCheckedIn) {
        showPopup(
          "warning",
          result.message ||
            "This ticket has already been checked in.",
        );
        return;
      }

      if (!response.ok) {
        showPopup(
          "error",
          result.error ||
            "The QR ticket could not be processed.",
        );
        return;
      }

      showPopup(
        "success",
        result.message ||
          "Check-in successful.",
      );
    } catch {
      showPopup(
        "error",
        "The QR ticket could not be processed.",
      );
    } finally {
      window.setTimeout(() => {
        processingRef.current = false;
      }, 1800);
    }
  }

  async function startScanner() {
    setPopupOpen(false);

    try {
      const { Html5Qrcode } =
        await import("html5-qrcode");

      const scanner =
        new Html5Qrcode(
          "volunteer-qr-reader",
        );

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 260,
            height: 260,
          },
        },
        handleSuccessfulScan,
        () => {},
      );

      setScannerActive(true);
    } catch (error) {
      console.error(error);

      scannerRef.current = null;
      setScannerActive(false);

      showPopup(
        "error",
        "Camera could not start. Allow camera permission and try again.",
      );
    }
  }

  async function stopScanner() {
    try {
      if (
        scannerRef.current?.isScanning
      ) {
        await scannerRef.current.stop();
      }

      scannerRef.current?.clear();
    } catch (error) {
      console.error(error);
    } finally {
      scannerRef.current = null;
      setScannerActive(false);
    }
  }

  useEffect(() => {
    return () => {
      if (
        scannerRef.current?.isScanning
      ) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }

      if (popupTimerRef.current) {
        window.clearTimeout(
          popupTimerRef.current,
        );
      }
    };
  }, []);

  const isSuccess =
    scanType === "success";

  const isWarning =
    scanType === "warning";

  const accent = isSuccess
    ? "#34e875"
    : isWarning
      ? "#f5c542"
      : "#ff5757";

  const title = isSuccess
    ? "CHECK-IN SUCCESSFUL"
    : isWarning
      ? "ALREADY CHECKED IN"
      : "CHECK-IN FAILED";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        padding: "22px 16px 40px",
      }}
    >
      <section
        style={{
          width: "min(100%, 620px)",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#d8a35d",
            fontWeight: "800",
          }}
        >
          Sat-Chit-Ānanda
        </p>

        <h1>Entry Scanner</h1>

        <p>
          Signed in as{" "}
          <strong>
            {volunteerName}
          </strong>
        </p>

        <small>
          {volunteerEmail}
        </small>

        <section
          style={{
            marginTop: "22px",
            background: "#101010",
            border: "1px solid #282828",
            borderRadius: "20px",
            padding: "18px",
          }}
        >
          <button
            type="button"
            onClick={
              scannerActive
                ? stopScanner
                : startScanner
            }
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: 0,
              fontSize: "17px",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            {scannerActive
              ? "Stop Scanner"
              : "Start Scanner"}
          </button>

          <div
            id="volunteer-qr-reader"
            style={{
              width: "100%",
              marginTop: "18px",
              overflow: "hidden",
              borderRadius: "16px",
            }}
          />

          <p
            style={{
              textAlign: "center",
              color: "#aaaaaa",
            }}
          >
            {scannerActive
              ? "Scanner ready — point the camera at the attendee QR code."
              : "Press Start Scanner and allow camera access."}
          </p>
        </section>

        <form
          action="/auth/signout"
          method="post"
          style={{
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
            }}
          >
            Sign Out
          </button>
        </form>
      </section>

      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "rgba(0,0,0,0.82)",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "min(94vw, 520px)",
              padding: "34px 24px",
              background: "#111111",
              borderRadius: "24px",
              border:
                `3px solid ${accent}`,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                color: accent,
              }}
            >
              {title}
            </h2>

            <p
              style={{
                whiteSpace: "pre-line",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {scanMessage}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}