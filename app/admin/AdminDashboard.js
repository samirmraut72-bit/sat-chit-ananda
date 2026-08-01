"use client";

import { useMemo, useState } from "react";

export default function AdminDashboard({
  initialRegistrations,
  adminName,
  adminEmail,
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState("");

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

  async function toggleCheckIn(registration) {
    setUpdatingId(registration.id);

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          checkedIn: !registration.checked_in,
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
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Check-in could not be updated.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  function exportCsv() {
    const headers = [
      "Registration Code",
      "Full Name",
      "Email",
      "Phone",
      "Places",
      "Status",
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
