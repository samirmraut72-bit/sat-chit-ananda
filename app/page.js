"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const artists = [
  {
    name: "Aadesh",
    slug: "aadesh",
    image: "/artists/aadesh.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "Anjuli Hamal",
    slug: "anjuli-hamal",
    image: "/artists/anjuli-hamal.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "Sabin Ghising",
    slug: "sabin-ghising",
    image: "/artists/sabin-ghising.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "Rozan Subedi",
    slug: "rozan-subedi",
    image: "/artists/rozan-subedi.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "Om B Shrestha",
    slug: "om-b-shrestha",
    image: "/artists/om-b-shrestha.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "Nischal Bista",
    slug: "nischal-bista",
    image: "/artists/nischal-bista.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "Aantariksha Dahal",
    slug: "aantariksha-dahal",
    image: "/artists/aantariksha-dahal.jpg",
    role: "Kirtan Artist",
  },
  {
    name: "AVI",
    slug: "avi",
    image: "/artists/avi.jpg",
    role: "Tabla Artist",
  },
];

async function getAvailability() {
  const response = await fetch("/api/availability", {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Availability could not be loaded.",
    );
  }

  return result;
}

function FooterInstagramIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient
          id="footerInstagramGradient"
          cx="30%"
          cy="105%"
          r="115%"
        >
          <stop offset="0%" stopColor="#ffd600" />
          <stop offset="28%" stopColor="#ff7a00" />
          <stop offset="52%" stopColor="#ff0169" />
          <stop offset="78%" stopColor="#d300c5" />
          <stop offset="100%" stopColor="#7638fa" />
        </radialGradient>
      </defs>

      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="11"
        fill="url(#footerInstagramGradient)"
      />

      <rect
        x="13"
        y="13"
        width="22"
        height="22"
        rx="7"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
      />

      <circle
        cx="24"
        cy="24"
        r="5.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
      />

      <circle
        cx="32.5"
        cy="15.8"
        r="2"
        fill="#ffffff"
      />
    </svg>
  );
}

function FooterTikTokIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="11"
        fill="#111111"
      />

      <path
        d="M27.5 10v18.4a7.5 7.5 0 1 1-6.4-7.4v4.8a2.9 2.9 0 1 0 1.7 2.6V10h4.7c.7 3.9 2.9 6.2 6.8 7.5v4.7a12.9 12.9 0 0 1-6.8-2.8V10Z"
        fill="none"
        stroke="#25f4ee"
        strokeWidth="4"
        strokeLinejoin="round"
        transform="translate(-1.2, 1.2)"
      />

      <path
        d="M27.5 10v18.4a7.5 7.5 0 1 1-6.4-7.4v4.8a2.9 2.9 0 1 0 1.7 2.6V10h4.7c.7 3.9 2.9 6.2 6.8 7.5v4.7a12.9 12.9 0 0 1-6.8-2.8V10Z"
        fill="none"
        stroke="#fe2c55"
        strokeWidth="4"
        strokeLinejoin="round"
        transform="translate(1.2, -1.2)"
      />

      <path
        d="M27.5 10v18.4a7.5 7.5 0 1 1-6.4-7.4v4.8a2.9 2.9 0 1 0 1.7 2.6V10h4.7c.7 3.9 2.9 6.2 6.8 7.5v4.7a12.9 12.9 0 0 1-6.8-2.8V10Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default function HomePage() {
  const [availability, setAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      try {
        const result = await getAvailability();

        if (active) {
          setAvailability(result);
          setAvailabilityError("");
        }
      } catch (error) {
        console.error(
          "Homepage availability error:",
          error,
        );

        if (active) {
          setAvailabilityError(
            "Live availability is temporarily unavailable.",
          );
        }
      }
    }

    loadAvailability();

    const interval = window.setInterval(
      loadAvailability,
      15000,
    );

    function refreshWhenFocused() {
      loadAvailability();
    }

    window.addEventListener(
      "focus",
      refreshWhenFocused,
    );

    return () => {
      active = false;

      window.clearInterval(interval);

      window.removeEventListener(
        "focus",
        refreshWhenFocused,
      );
    };
  }, []);

  const soldOut =
    availability?.soldOut === true ||
    availability?.registrationOpen === false ||
    availability?.available === 0;

  return (
    <main>
      <header className="siteHeader">
        <Link className="brand" href="/">
          <span className="brandMark">ॐ</span>

          <span className="brandName">
            Sat-Chit-{"\u0100"}nanda
          </span>
        </Link>

        <nav
          className="navLinks"
          aria-label="Main navigation"
        >
          <a href="#about">About</a>
          <a href="#artists">Artists</a>
          <a href="#details">Details</a>

          <Link
            className="adminNavLink"
            href="/admin"
          >
            Admin Login
          </Link>

          <Link
            className="navButton"
            href="/register"
          >
            Register
          </Link>
        </nav>

        <div className="mobileHeaderActions">
          <a
            className="mobileHeaderButton"
            href="#artists"
          >
            Artists
          </a>

          <Link
            className="mobileHeaderButton"
            href="/admin"
          >
            Admin
          </Link>

          <Link
            className="mobileRegisterButton"
            href="/register"
          >
            Register
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroContent">
          <div className="heroCollaboration">
            <img
              src="/artists/NRNA.jpg"
              alt="NRNA logo"
              className="heroNrnaLogo"
            />

            <p>
              NRNA in collaboration with Project Beyond
            </p>
          </div>

          <p className="eyebrow">
            An Intimate Kirtan Gathering Session TEST
          </p>

          <div className="ornament">
            ✦ ॐ ✦
          </div>

          <h1 className="heroTitle">
            Sat-Chit-{"\u0100"}nanda
          </h1>

          <p className="heroText">
            An evening of sacred sound, collective chanting,
            stillness and community.
          </p>

          <div className="heroFacts">
            <div
              className="heroFactsCircle"
              aria-hidden="true"
            />

            <div className="heroFactCard">
              <span>Date</span>

              <strong>
                Friday, 14 August 2026
              </strong>
            </div>

            <div className="heroFactCard">
              <span>Time</span>

              <strong>
                6:45 PM – 9:00 PM
              </strong>
            </div>

            <div className="heroFactCard">
              <span>Entry</span>

              <strong>
                Free Registration
              </strong>
            </div>
          </div>

          <div
            className={
              soldOut
                ? "homeAvailability homeAvailabilitySoldOut"
                : "homeAvailability"
            }
          >
            <span className="homeAvailabilityPulse" />

            <div>
              <small>
                {soldOut
                  ? "Sat-Chit-Ānanda"
                  : "Live availability"}
              </small>

              {availability ? (
                soldOut ? (
                  <>
                    <strong>
                      Thank you for being part of this beautiful gathering.
                    </strong>

                    <p className="finalRegistrationNotice">
                      Stay connected with us for the next journey. ✨
                    </p>
                  </>
                ) : (
                  <strong>
                    Available spots: {availability.available}
                  </strong>
                )
              ) : (
                <strong>
                  Checking available spots...
                </strong>
              )}

              {availabilityError && (
                <p>{availabilityError}</p>
              )}
            </div>
          </div>

          <div className="heroActions">
            <Link
              className={
                soldOut
                  ? "primaryButton soldOutButton"
                  : "primaryButton"
              }
              href={soldOut ? "#" : "/register"}
              aria-disabled={soldOut}
              onClick={(event) => {
                if (soldOut) {
                  event.preventDefault();
                }
              }}
            >
              {soldOut
                ? "Event Closed"
                : "Reserve a Spot"}
            </Link>

            <a
              className="secondaryButton"
              href="#details"
            >
              View Event Details
            </a>
          </div>

          <p className="capacityNote">
            Individual registration required.
          </p>
        </div>

        <div className="scrollHint">
          Scroll to discover ↓
        </div>
      </section>

      <section
        id="about"
        className="section lightSection aboutBackgroundSection"
      >
        <div className="aboutBackgroundOverlay" />

        <div className="sectionGrid aboutBackgroundContent">
          <div>
            <h2>
              A shared journey through mantra and music
            </h2>
          </div>

          <div className="bodyCopy">
            <p>
              Sat-Chit-Ānanda is an initiative created with the
              sole aim of bringing like-minded people together
              through devotional and spiritually inspired
              music. In a time when people are constantly
              rushing, stressed, and mentally overwhelmed, this
              gathering offers a space to slow down, find calm,
              and reconnect with a sense of positivity.
            </p>

            <p>
              It fosters a supportive community that values
              mental health and healing through various forms
              of music, chants, and dance. In essence,
              Sat-Chit-Ānanda provides a sacred sanctuary where
              participants can immerse themselves in an
              uplifting experience, cultivating mindfulness,
              peace, and inner balance in an intimate setting.
            </p>

            <p>
              This initiative is a collective effort by Project
              Beyond and NRNA to revive the spirit of community
              and healing through the power of art—offering a
              space to pause and breathe amid the rush of
              everyday life.
            </p>
          </div>
        </div>
      </section>

      <section
        id="artists"
        className="section darkSection"
      >
        <div className="sectionHeading centered">
          <p className="sectionEyebrow gold">
            Featured artists
          </p>

          <h2>
            Voices of the evening
          </h2>

          <p>
            Select an artist to view their profile and
            introduction.
          </p>
        </div>

        <div className="artistGrid">
          {artists.map((artist) => (
            <Link
              className="artistCard"
              href={`/artists/${artist.slug}`}
              key={artist.slug}
            >
              <div className="artistPortrait">
                <img
                  src={artist.image}
                  alt={`${artist.name} performing at Sat-Chit-\u0100nanda`}
                />
              </div>

              <h3>{artist.name}</h3>
              <p>{artist.role}</p>

              <span className="artistProfileLink">
                View Profile →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="details"
        className="section detailSection"
      >
        <div className="detailCard">
          <div className="detailIntro">
            <p className="sectionEyebrow">
              Event details
            </p>

            <h2>
              Everything you need to know
            </h2>

            <p>
              Admission is free. Each attendee must complete an
              individual registration.
            </p>
          </div>

          <div className="detailList">
            <div className="detailItem">
              <span>01</span>

              <div>
                <small>Date</small>

                <strong>
                  Friday, 14 August 2026
                </strong>
              </div>
            </div>

            <div className="detailItem">
              <span>02</span>

              <div>
                <small>Time</small>

                <strong>
                  6:45 PM – 9:00 PM
                </strong>
              </div>
            </div>

            <div className="detailItem">
              <span>03</span>

              <div>
                <small>Venue</small>

                <strong>
                  The Granville Centre
                </strong>
              </div>
            </div>

            <div className="detailItem">
              <span>04</span>

              <div>
                <small>Ticket price</small>

                <strong>$0.00</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <div>
          <p className="sectionEyebrow gold">
            Join the gathering
          </p>

          <h2>
            {soldOut
              ? "Thank you for being part of this beautiful gathering."
              : "Reserve your free place today"}
          </h2>

          <p>
            {availability && !soldOut
              ? `${availability.available} places currently available.`
              : soldOut
                ? "Stay connected with us for the next journey. ✨"
                : "One registration reserves one place only."}
          </p>
        </div>

        <Link
          className={
            soldOut
              ? "primaryButton soldOutButton"
              : "primaryButton"
          }
          href={soldOut ? "#" : "/register"}
          aria-disabled={soldOut}
          onClick={(event) => {
            if (soldOut) {
              event.preventDefault();
            }
          }}
        >
          {soldOut
            ? "Event Closed"
            : "Reserve a Spot"}
        </Link>
      </section>

      <footer className="footer">
        <div className="footerBrandBlock">
          <div className="footerFollowRow">
            <span className="footerFollowText">
              Follow for more
            </span>

            <div className="footerSocials">
              <a
                className="footerSocialIconLink"
                href="https://www.instagram.com/theproject_beyond?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Project Beyond on Instagram"
                title="Project Beyond on Instagram"
              >
                <FooterInstagramIcon />
              </a>

              <a
                className="footerSocialIconLink"
                href="https://www.tiktok.com/@project_beyond_1?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Project Beyond on TikTok"
                title="Project Beyond on TikTok"
              >
                <FooterTikTokIcon />
              </a>
            </div>
          </div>

          <strong>
            Sat-Chit-Ānanda
          </strong>

          <p>
            14 August 2026 · The Granville Centre
          </p>
        </div>

        <div>
          <a href="mailto:Samir.m.raut72@gmail.com">
            Samir.m.raut72@gmail.com
          </a>

          <a href="tel:+61415950600">
            0415 950 600
          </a>
        </div>

        <Link
          className="adminLink"
          href="/admin"
        >
          Admin Login
        </Link>
      </footer>
    </main>
  );
}