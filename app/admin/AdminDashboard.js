"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function AdminDashboard({
  initialRegistrations,
  adminName,
  adminEmail,
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [scanType, setScanType] = useState("");

  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return registrations;

    return registrations.filter((item) =>
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

  const activeRegistrations = registrations.filter(
    (item) => item.status === "confirmed",
  );

  const reservedPlaces = activeRegistrations.reduce(
    (sum, item) => sum + Number(item.ticket_quantity),
    0,
  );

  const checkedInPlaces = activeRegistrations
    .filter((item) => item.checked_in)
    .reduce((sum, item) => sum + Number(item.ticket_quantity), 0);

  async function updateCheckIn(registration, checkedIn) {
    setUpdatingId(registration.id);

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          checkedIn,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Check-in could not be updated.");
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === registration.id
            ? { ...item, checked_in: result.checkedIn }
            : item,
        ),
      );

      return result.checkedIn;
    } finally {
      setUpdatingId("");
    }
  }

  async function toggleCheckIn(registration) {
    try {
      await updateCheckIn(registration, !registration.checked_in);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Check-in could not be updated.",
      );
    }
  }

  function extractQrToken(decodedText) {
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split("/").filter(Boolean);

      if (parts[0] === "ticket" && parts[1]) {
        return parts[1];
      }
    } catch {
      const parts = decodedText.split("/").filter(Boolean);
      return parts.at(-1) || "";
    }

    return "";
  }

  async function handleSuccessfulScan(decodedText) {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      const qrToken = extractQrToken(decodedText);

      if (!qrToken) {
        setScanType("error");
        setScanMessage("Invalid QR ticket.");
        return;
      }

      const registration = registrations.find(
        (item) => item.qr_token === qrToken,
      );

      if (!registration) {
        setScanType("error");
        setScanMessage("Ticket not found in the registration database.");
        return;
      }

      if (!registration.email_verified) {
        setScanType("error");
        setScanMessage(
          `${registration.full_name}'s email has not been verified.`,
        );
        return;
      }

      if (registration.status !== "confirmed") {
        setScanType("error");
        setScanMessage(
          `${registration.full_name}'s registration is not confirmed.`,
        );
        return;
      }

      if (registration.checked_in) {
        setScanType("warning");
        setScanMessage(
          `${registration.full_name} has already been checked in.`,
        );
        return;
      }

      await updateCheckIn(registration, true);

      setScanType("success");
      setScanMessage(
        `${registration.full_name} checked in successfully. Code: ${registration.registration_code}`,
      );
    } catch (error) {
      setScanType("error");
      setScanMessage(
        error instanceof Error
          ? error.message
          : "The QR ticket could not be processed.",
      );
    } finally {
      window.setTimeout(() => {
        processingRef.current = false;
      }, 1800);
    }
  }

  async function startScanner() {
    setScanMessage("");
    setScanType("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("admin-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleSuccessfulScan,
        () => {},
      );

      setScannerActive(true);
    } catch (error) {
      scannerRef.current = null;
      setScannerActive(false);
      setScanType("error");
      setScanMessage(
        "Camera could not start. Allow camera permission and try again.",
      );

      console.error("QR scanner error:", error);
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }

      scannerRef.current?.clear();
    } catch (error) {
      console.error("Could not stop QR scanner:", error);
    } finally {
      scannerRef.current = null;
      setScannerActive(false);
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
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

    const rows = registrations.map((item) => [
      item.registration_code,
      item.full_name,
      item.email,
      item.phone,
      item.ticket_quantity,
      item.status,
      item.email_verified ? "Yes" : "No",
      item.checked_in ? "Yes" : "No",
      item.created_at,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sat-chit-ananda-registrations.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <div>
          <p className="sectionEyebrow gold">Organiser portal</p>
          <h1>Registration dashboard</h1>
          <p>
            Signed in as <strong>{adminName}</strong> ({adminEmail})
          </p>
        </div>

        <div className="adminActions">
          <a href="/" className="adminActionLink">
            View public website
          </a>

          <button onClick={exportCsv} disabled={!registrations.length}>
            Export CSV
          </button>

          <form action="/auth/signout" method="post">
            <button className="dangerButton" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="statGrid">
        <article>
          <small>Registrations</small>
          <strong>{activeRegistrations.length}</strong>
        </article>

        <article>
          <small>Reserved places</small>
          <strong>{reservedPlaces}</strong>
        </article>

        <article>
          <small>Remaining capacity</small>
          <strong>{Math.max(350 - reservedPlaces, 0)}</strong>
        </article>

        <article>
          <small>Checked in</small>
          <strong>{checkedInPlaces}</strong>
        </article>
      </section>

      <section
        className="adminTableCard"
        style={{ marginBottom: "24px", padding: "24px" }}
      >
        <div className="tableToolbar">
          <div>
            <h2>QR ticket scanner</h2>
            <p>Scan an attendee’s confirmed ticket to check them in.</p>
          </div>

          <button
            type="button"
            onClick={scannerActive ? stopScanner : startScanner}
          >
            {scannerActive ? "Stop scanner" : "Start scanner"}
          </button>
        </div>

        <div
          id="admin-qr-reader"
          style={{
            maxWidth: "480px",
            margin: scannerActive ? "24px auto 0" : "0 auto",
            overflow: "hidden",
            borderRadius: "14px",
          }}
        />

        {scanMessage ? (
          <div
            style={{
              maxWidth: "620px",
              margin: "20px auto 0",
              padding: "16px",
              borderRadius: "10px",
              textAlign: "center",
              fontWeight: "700",
              background:
                scanType === "success"
                  ? "#e7f7ed"
                  : scanType === "warning"
                    ? "#fff4d6"
                    : "#fde8e8",
              color:
                scanType === "success"
                  ? "#176b37"
                  : scanType === "warning"
                    ? "#805b00"
                    : "#9b1c1c",
            }}
          >
            {scanMessage}
          </div>
        ) : null}
      </section>

      <section className="adminTableCard">
        <div className="tableToolbar">
          <div>
            <h2>Attendee list</h2>
            <p>
              {filtered.length} record{filtered.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone or code"
          />
        </div>

        {filtered.length ? (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Contact</th>
                  <th>Code</th>
                  <th>Places</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.full_name}</strong>
                      <small>
                        {new Date(item.created_at).toLocaleString("en-AU")}
                      </small>
                    </td>

                    <td>
                      <span>{item.email}</span>
                      <small>{item.phone}</small>
                    </td>

                    <td>
                      <code>{item.registration_code}</code>
                    </td>

                    <td>{item.ticket_quantity}</td>

                    <td>
                      <span
                        className={
                          item.checked_in
                            ? "statusChecked"
                            : "statusPending"
                        }
                      >
                        {item.checked_in ? "Checked in" : "Registered"}
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
                        disabled={updatingId === item.id}
                        onClick={() => toggleCheckIn(item)}
                      >
                        {updatingId === item.id
                          ? "Saving..."
                          : item.checked_in
                            ? "Undo"
                            : "Check in"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="emptyState">
            <div>ॐ</div>
            <h3>No matching registrations</h3>
            <p>New public registrations will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}