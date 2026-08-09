"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export default function AdminDashboard({
  initialRegistrations,
  adminName,
  adminEmail,
}) {
  const [registrations, setRegistrations] =
    useState(initialRegistrations);

  const [query, setQuery] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState("");

  const [scannerActive, setScannerActive] =
    useState(false);

  const [scanMessage, setScanMessage] =
    useState("");

  const [scanType, setScanType] =
    useState("");

  const [scanPopupOpen, setScanPopupOpen] =
    useState(false);

  const scannerRef =
    useRef(null);

  const processingRef =
    useRef(false);

  const audioContextRef =
    useRef(null);

  const popupTimerRef =
    useRef(null);

  const filtered = useMemo(() => {
    const term =
      query.trim().toLowerCase();

    if (!term) {
      return registrations;
    }

    return registrations.filter(
      (item) =>
        [
          item.full_name,
          item.email,
          item.phone,
          item.registration_code,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
    );
  }, [registrations, query]);

  const activeRegistrations =
    registrations.filter(
      (item) =>
        item.status === "confirmed",
    );

  const reservedPlaces =
    activeRegistrations.reduce(
      (sum, item) =>
        sum +
        Number(item.ticket_quantity),
      0,
    );

  const checkedInPlaces =
    activeRegistrations
      .filter(
        (item) => item.checked_in,
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.ticket_quantity,
          ),
        0,
      );

  function getAudioContext() {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (
      !audioContextRef.current
    ) {
      audioContextRef.current =
        new AudioContextClass();
    }

    return audioContextRef.current;
  }

  async function unlockAudio() {
    try {
      const audioContext =
        getAudioContext();

      if (!audioContext) {
        return;
      }

      if (
        audioContext.state ===
        "suspended"
      ) {
        await audioContext.resume();
      }

      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      oscillator.frequency.value =
        440;

      oscillator.type =
        "sine";

      gainNode.gain.value =
        0.0001;

      oscillator.connect(
        gainNode,
      );

      gainNode.connect(
        audioContext.destination,
      );

      oscillator.start();

      oscillator.stop(
        audioContext.currentTime +
          0.05,
      );
    } catch (error) {
      console.error(
        "Could not unlock scanner audio:",
        error,
      );
    }
  }

  function playTone({
    frequency,
    duration,
    volume = 0.35,
    delay = 0,
    type = "sine",
  }) {
    try {
      const audioContext =
        getAudioContext();

      if (!audioContext) {
        return;
      }

      if (
        audioContext.state ===
        "suspended"
      ) {
        audioContext
          .resume()
          .catch(() => {});
      }

      const startTime =
        audioContext.currentTime +
        delay;

      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      oscillator.type =
        type;

      oscillator.frequency.setValueAtTime(
        frequency,
        startTime,
      );

      gainNode.gain.setValueAtTime(
        0.001,
        startTime,
      );

      gainNode.gain.linearRampToValueAtTime(
        volume,
        startTime + 0.015,
      );

      gainNode.gain.linearRampToValueAtTime(
        0.001,
        startTime + duration,
      );

      oscillator.connect(
        gainNode,
      );

      gainNode.connect(
        audioContext.destination,
      );

      oscillator.start(
        startTime,
      );

      oscillator.stop(
        startTime +
          duration +
          0.03,
      );
    } catch (error) {
      console.error(
        "Scanner sound error:",
        error,
      );
    }
  }

  function playSuccessSound() {
    playTone({
      frequency: 1250,
      duration: 0.22,
      volume: 0.4,
      type: "square",
    });

    if (
      typeof navigator !==
        "undefined" &&
      navigator.vibrate
    ) {
      navigator.vibrate(120);
    }
  }

  function playErrorSound() {
    playTone({
      frequency: 300,
      duration: 0.2,
      volume: 0.4,
      type: "square",
    });

    playTone({
      frequency: 190,
      duration: 0.28,
      volume: 0.4,
      delay: 0.23,
      type: "square",
    });

    if (
      typeof navigator !==
        "undefined" &&
      navigator.vibrate
    ) {
      navigator.vibrate([
        120,
        80,
        180,
      ]);
    }
  }

  function openScanPopup(
    type,
    message,
  ) {
    setScanType(type);
    setScanMessage(message);
    setScanPopupOpen(true);

    if (
      popupTimerRef.current
    ) {
      window.clearTimeout(
        popupTimerRef.current,
      );
    }

    popupTimerRef.current =
      window.setTimeout(
        () => {
          setScanPopupOpen(false);
        },
        2200,
      );
  }

  function showScanError(
    message,
  ) {
    openScanPopup(
      "error",
      message,
    );

    playErrorSound();
  }

  function showScanWarning(
    message,
  ) {
    openScanPopup(
      "warning",
      message,
    );

    playErrorSound();
  }

  function showScanSuccess(
    message,
  ) {
    openScanPopup(
      "success",
      message,
    );

    playSuccessSound();
  }

  async function updateCheckIn(
    registration,
    checkedIn,
  ) {
    setUpdatingId(
      registration.id,
    );

    try {
      const response =
        await fetch(
          "/api/admin/check-in",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              registrationId:
                registration.id,

              checkedIn,
            }),
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Check-in could not be updated.",
        );
      }

      setRegistrations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              registration.id
                ? {
                    ...item,
                    checked_in:
                      result.checkedIn,
                  }
                : item,
          ),
      );

      return result.checkedIn;
    } finally {
      setUpdatingId("");
    }
  }

  async function toggleCheckIn(
    registration,
  ) {
    try {
      await updateCheckIn(
        registration,
        !registration.checked_in,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Check-in could not be updated.",
      );
    }
  }

  function extractQrToken(
    decodedText,
  ) {
    try {
      const url =
        new URL(decodedText);

      const parts =
        url.pathname
          .split("/")
          .filter(Boolean);

      if (
        parts[0] === "ticket" &&
        parts[1]
      ) {
        return parts[1];
      }
    } catch {
      const parts =
        decodedText
          .split("/")
          .filter(Boolean);

      return parts.at(-1) || "";
    }

    return "";
  }

  async function handleSuccessfulScan(
    decodedText,
  ) {
    if (
      processingRef.current
    ) {
      return;
    }

    processingRef.current = true;

    try {
      const qrToken =
        extractQrToken(
          decodedText,
        );

      if (!qrToken) {
        showScanError(
          "Invalid QR ticket.",
        );

        return;
      }

      const registration =
        registrations.find(
          (item) =>
            item.qr_token ===
            qrToken,
        );

      if (!registration) {
        showScanError(
          "Ticket not found in the registration database.",
        );

        return;
      }

      if (
        !registration.email_verified
      ) {
        showScanError(
          `${registration.full_name}'s email has not been verified.`,
        );

        return;
      }

      if (
        registration.status !==
        "confirmed"
      ) {
        showScanError(
          `${registration.full_name}'s registration is not confirmed.`,
        );

        return;
      }

      if (
        registration.checked_in
      ) {
        showScanWarning(
          `${registration.full_name} has already been checked in.`,
        );

        return;
      }

      await updateCheckIn(
        registration,
        true,
      );

      showScanSuccess(
        `${registration.full_name} checked in successfully. Code: ${registration.registration_code}`,
      );
    } catch (error) {
      showScanError(
        error instanceof Error
          ? error.message
          : "The QR ticket could not be processed.",
      );
    } finally {
      window.setTimeout(
        () => {
          processingRef.current =
            false;
        },
        1800,
      );
    }
  }

  async function startScanner() {
    setScanMessage("");
    setScanType("");
    setScanPopupOpen(false);

    await unlockAudio();

    try {
      const {
        Html5Qrcode,
      } = await import(
        "html5-qrcode"
      );

      const scanner =
        new Html5Qrcode(
          "admin-qr-reader",
        );

      scannerRef.current =
        scanner;

      await scanner.start(
        {
          facingMode:
            "environment",
        },
        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 250,
          },
        },
        handleSuccessfulScan,
        () => {},
      );

      setScannerActive(true);
    } catch (error) {
      scannerRef.current =
        null;

      setScannerActive(false);

      showScanError(
        "Camera could not start. Allow camera permission and try again.",
      );

      console.error(
        "QR scanner error:",
        error,
      );
    }
  }

  async function stopScanner() {
    try {
      if (
        scannerRef.current
          ?.isScanning
      ) {
        await scannerRef.current.stop();
      }

      scannerRef.current?.clear();
    } catch (error) {
      console.error(
        "Could not stop QR scanner:",
        error,
      );
    } finally {
      scannerRef.current =
        null;

      setScannerActive(false);
    }
  }

  useEffect(() => {
    return () => {
      if (
        scannerRef.current
          ?.isScanning
      ) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }

      if (
        audioContextRef.current
      ) {
        audioContextRef.current
          .close()
          .catch(() => {});
      }

      if (
        popupTimerRef.current
      ) {
        window.clearTimeout(
          popupTimerRef.current,
        );
      }
    };
  }, []);

  function exportCsv() {
    const headers = [
      "Registration Code",
      "Full Name",
      "Email",
      "Phone",
      "Places",
      "Status",
      "Email Verified",
      "Checked In",
      "Created At",
    ];

    const rows =
      registrations.map(
        (item) => [
          item.registration_code,
          item.full_name,
          item.email,
          item.phone,
          item.ticket_quantity,
          item.status,
          item.email_verified
            ? "Yes"
            : "No",
          item.checked_in
            ? "Yes"
            : "No",
          item.created_at,
        ],
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? "",
              ).replaceAll(
                '"',
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "sat-chit-ananda-registrations.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  const popupIsSuccess =
    scanType === "success";

  const popupIsWarning =
    scanType === "warning";

  const popupAccent =
    popupIsSuccess
      ? "#34e875"
      : popupIsWarning
        ? "#f5c542"
        : "#ff5757";

  const popupBackground =
    popupIsSuccess
      ? "#06140b"
      : popupIsWarning
        ? "#171300"
        : "#180606";

  const popupTitle =
    popupIsSuccess
      ? "CHECK-IN SUCCESSFUL"
      : popupIsWarning
        ? "ALREADY CHECKED IN"
        : "CHECK-IN FAILED";

  const popupSymbol =
    popupIsSuccess
      ? "✓"
      : popupIsWarning
        ? "!"
        : "✕";

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <div>
          <p className="sectionEyebrow gold">
            Organiser portal
          </p>

          <h1>
            Registration dashboard
          </h1>

          <p>
            Signed in as{" "}
            <strong>
              {adminName}
            </strong>{" "}
            ({adminEmail})
          </p>
        </div>

        <div className="adminActions">
          <a
            href="/"
            className="adminActionLink"
          >
            View public website
          </a>

          <button
            onClick={exportCsv}
            disabled={
              !registrations.length
            }
          >
            Export CSV
          </button>

          <form
            action="/auth/signout"
            method="post"
          >
            <button
              className="dangerButton"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="statGrid">
        <article>
          <small>
            Registrations
          </small>

          <strong>
            {
              activeRegistrations.length
            }
          </strong>
        </article>

        <article>
          <small>
            Reserved places
          </small>

          <strong>
            {reservedPlaces}
          </strong>
        </article>

        <article>
          <small>
            Remaining capacity
          </small>

          <strong>
            {Math.max(
              350 -
                reservedPlaces,
              0,
            )}
          </strong>
        </article>

        <article>
          <small>
            Checked in
          </small>

          <strong>
            {checkedInPlaces}
          </strong>
        </article>
      </section>

      <section
        className="adminTableCard"
        style={{
          marginBottom: "24px",
          padding: "24px",
          background:
            "#050505",
          border:
            "1px solid #242424",
          boxShadow:
            "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div className="tableToolbar">
          <div>
            <h2
              style={{
                color: "#ffffff",
                marginBottom: "6px",
              }}
            >
              QR ticket scanner
            </h2>

            <p
              style={{
                color: "#c8c8c8",
              }}
            >
              Scan an attendee’s
              confirmed ticket to
              check them in.
            </p>
          </div>

          <button
            type="button"
            onClick={
              scannerActive
                ? stopScanner
                : startScanner
            }
            style={{
              background:
                scannerActive
                  ? "#2a2a2a"
                  : "#ffffff",

              color:
                scannerActive
                  ? "#ffffff"
                  : "#050505",

              border:
                "1px solid #5a5a5a",

              fontWeight:
                "800",
            }}
          >
            {scannerActive
              ? "Stop scanner"
              : "Start scanner"}
          </button>
        </div>

        <div
          style={{
            maxWidth: "520px",

            margin:
              scannerActive
                ? "24px auto 0"
                : "18px auto 0",

            padding:
              scannerActive
                ? "10px"
                : "0",

            borderRadius:
              "18px",

            background:
              "#000000",

            border:
              scannerActive
                ? "2px solid #333333"
                : "1px solid #1f1f1f",

            overflow:
              "hidden",
          }}
        >
          <div
            id="admin-qr-reader"
            style={{
              width: "100%",

              minHeight:
                scannerActive
                  ? "320px"
                  : "0",

              overflow:
                "hidden",

              borderRadius:
                "14px",

              background:
                "#000000",

              color:
                "#ffffff",
            }}
          />
        </div>

        {!scannerActive ? (
          <p
            style={{
              textAlign:
                "center",

              margin:
                "18px 0 0",

              color:
                "#9a9a9a",

              fontSize:
                "14px",
            }}
          >
            Press Start scanner
            and allow camera
            access.
          </p>
        ) : (
          <p
            style={{
              textAlign:
                "center",

              margin:
                "18px 0 0",

              color:
                "#b8b8b8",

              fontSize:
                "14px",

              fontWeight:
                "700",
            }}
          >
            Scanner active —
            point the camera at
            the attendee QR code.
          </p>
        )}
      </section>

      <section className="adminTableCard">
        <div className="tableToolbar">
          <div>
            <h2>
              Attendee list
            </h2>

            <p>
              {filtered.length}{" "}
              record
              {filtered.length ===
              1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>

          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Search name, email, phone or code"
          />
        </div>

        {filtered.length ? (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Guest
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Code
                  </th>

                  <th>
                    Places
                  </th>

                  <th>
                    Status
                  </th>

                  <th />
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            item.full_name
                          }
                        </strong>

                        <small>
                          {new Date(
                            item.created_at,
                          ).toLocaleString(
                            "en-AU",
                          )}
                        </small>
                      </td>

                      <td>
                        <span>
                          {
                            item.email
                          }
                        </span>

                        <small>
                          {
                            item.phone
                          }
                        </small>
                      </td>

                      <td>
                        <code>
                          {
                            item.registration_code
                          }
                        </code>
                      </td>

                      <td>
                        {
                          item.ticket_quantity
                        }
                      </td>

                      <td>
                        <span
                          className={
                            item.checked_in
                              ? "statusChecked"
                              : "statusPending"
                          }
                        >
                          {item.checked_in
                            ? "Checked in"
                            : "Registered"}
                        </span>

                        <small>
                          {item.email_verified
                            ? "Email verified"
                            : "Email unverified"}
                        </small>
                      </td>

                      <td>
                        <button
                          className="tableButton"
                          disabled={
                            updatingId ===
                            item.id
                          }
                          onClick={() =>
                            toggleCheckIn(
                              item,
                            )
                          }
                        >
                          {updatingId ===
                          item.id
                            ? "Saving..."
                            : item.checked_in
                              ? "Undo"
                              : "Check in"}
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="emptyState">
            <div>
              ॐ
            </div>

            <h3>
              No matching
              registrations
            </h3>

            <p>
              New public
              registrations will
              appear here.
            </p>
          </div>
        )}
      </section>

      {scanPopupOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: "24px",

            background:
              "rgba(0,0,0,0.78)",

            backdropFilter:
              "blur(6px)",
          }}
        >
          <div
            style={{
              width:
                "min(92vw, 520px)",

              background:
                popupBackground,

              border:
                `3px solid ${popupAccent}`,

              borderRadius:
                "24px",

              padding:
                "36px 26px",

              textAlign:
                "center",

              boxShadow:
                `0 0 0 1px ${popupAccent}30, 0 25px 80px rgba(0,0,0,0.65)`,

              color:
                "#ffffff",
            }}
          >
            <div
              style={{
                width:
                  "88px",

                height:
                  "88px",

                margin:
                  "0 auto 22px",

                borderRadius:
                  "50%",

                border:
                  `4px solid ${popupAccent}`,

                color:
                  popupAccent,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                fontSize:
                  "52px",

                fontWeight:
                  "900",

                lineHeight:
                  1,
              }}
            >
              {popupSymbol}
            </div>

            <h2
              style={{
                margin:
                  "0 0 16px",

                color:
                  popupAccent,

                fontSize:
                  "clamp(26px, 7vw, 38px)",

                fontWeight:
                  "900",

                letterSpacing:
                  "0.04em",
              }}
            >
              {popupTitle}
            </h2>

            <p
              style={{
                margin:
                  "0 auto",

                maxWidth:
                  "430px",

                color:
                  "#ffffff",

                fontSize:
                  "clamp(17px, 4.5vw, 22px)",

                fontWeight:
                  "700",

                lineHeight:
                  1.5,
              }}
            >
              {scanMessage}
            </p>

            <p
              style={{
                margin:
                  "22px 0 0",

                color:
                  "#bdbdbd",

                fontSize:
                  "13px",
              }}
            >
              Scanner will be ready
              for the next attendee.
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}