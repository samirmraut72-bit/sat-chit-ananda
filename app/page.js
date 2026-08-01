import Link from "next/link";

const artists = [
  {
    name: "Rozan Subedi",
    slug: "rozan-subedi",
    image: "/artists/rozan-subedi.jpg",
  },
  {
    name: "Aadesh",
    slug: "aadesh",
    image: "/artists/aadesh.jpg",
  },
  {
    name: "Sabin Ghising",
    slug: "sabin-ghising",
    image: "/artists/sabin-ghising.jpg",
  },
  {
    name: "Nischal Bista",
    slug: "nischal-bista",
    image: "/artists/nischal-bista.jpg",
  },
  {
    name: "Anjuli Hamal",
    slug: "anjuli-hamal",
    image: "/artists/anjuli-hamal.jpg",
  },
  {
    name: "Om B Shrestha",
    slug: "om-b-shrestha",
    image: "/artists/om-b-shrestha.jpg",
  },
  {
    name: "Aantariksha Dahal",
    slug: "aantariksha-dahal",
    image: "/artists/aantariksha-dahal.jpg",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="siteHeader">
        <Link className="brand" href="/">
          <span className="brandMark">ॐ</span>
          <span>Sat-Chit-Ānanda</span>
        </Link>

        <nav className="navLinks" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#artists">Artists</a>
          <a href="#details">Details</a>

          <Link className="navButton" href="/register">
            Register
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroContent">
          <p className="eyebrow">
            An Intimate Kirtan Gathering Session
          </p>

          <div className="ornament">✦ ॐ ✦</div>

          <h1>Sat-Chit-Ānanda</h1>

          <p className="heroText">
            An evening of sacred sound, collective chanting, stillness and
            community.
          </p>

          <div className="heroFacts">
            <div>
              <span>Date</span>
              <strong>Friday, 14 August 2026</strong>
            </div>

            <div>
              <span>Time</span>
              <strong>7:00 PM – 9:00 PM</strong>
            </div>

            <div>
              <span>Entry</span>
              <strong>Free Registration</strong>
            </div>
          </div>

          <div className="heroActions">
            <Link className="primaryButton" href="/register">
              Reserve Your Place
            </Link>

            <a className="secondaryButton" href="#details">
              View Event Details
            </a>
          </div>

          <p className="capacityNote">
            Individual registration required · Maximum capacity 350
          </p>
        </div>

        <div className="scrollHint">Scroll to discover ↓</div>
      </section>

<section id="about" className="section lightSection aboutBackgroundSection">
  <div className="aboutBackgroundOverlay" />

  <div className="sectionGrid aboutBackgroundContent">
    <div>

      <h2>A shared journey through mantra and music</h2>
    </div>

    <div className="bodyCopy">
      <p>
        Sat-Chit-Ānanda is an initiative created with the sole aim of bringing
        like-minded people together through devotional and spiritually inspired
        music. In a time when people are constantly rushing, stressed, and
        mentally overwhelmed, this gathering offers a space to slow down, find
        calm, and reconnect with a sense of positivity.
      </p>

      <p>
        It fosters a supportive community that values mental health and healing
        through various forms of music, chants, and dance. In essence,
        Sat-Chit-Ānanda provides a sacred sanctuary where participants can
        immerse themselves in an uplifting experience, cultivating mindfulness,
        peace, and inner balance in an intimate setting.
      </p>

      <p>
        This initiative is a collective effort by Project Beyond and NRNA to
        revive the spirit of community and healing through the power of
        art—offering a space to pause and breathe amid the rush of everyday
        life.
      </p>
    </div>
  </div>
</section>

      <section id="artists" className="section darkSection">
        <div className="sectionHeading centered">
          <p className="sectionEyebrow gold">Featured artists</p>
          <h2>Voices of the evening</h2>
          <p>Select an artist to view their profile and introduction.</p>
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
                  alt={`${artist.name} performing at Sat-Chit-Ānanda`}
                />
              </div>

              <h3>{artist.name}</h3>
              <p>Kirtan Artist</p>
              <span className="artistProfileLink">View Profile →</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="details" className="section detailSection">
        <div className="detailCard">
          <div className="detailIntro">
            <p className="sectionEyebrow">Event details</p>
            <h2>Everything you need to know</h2>

            <p>
              Admission is free. Each attendee must complete an individual
              registration.
            </p>
          </div>

          <div className="detailList">
            <div className="detailItem">
              <span>01</span>

              <div>
                <small>Date</small>
                <strong>Friday, 14 August 2026</strong>
              </div>
            </div>

            <div className="detailItem">
              <span>02</span>

              <div>
                <small>Time</small>
                <strong>7:00 PM – 9:00 PM</strong>
              </div>
            </div>

            <div className="detailItem">
              <span>03</span>

              <div>
                <small>Venue</small>
                <strong>Granville Community Centre</strong>
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
          <p className="sectionEyebrow gold">Join the gathering</p>
          <h2>Reserve your free place today</h2>
          <p>One registration reserves one place only.</p>
        </div>

        <Link className="primaryButton" href="/register">
          Complete Registration
        </Link>
      </section>

      <footer className="footer">
        <div>
          <strong>Sat-Chit-Ānanda</strong>
          <p>14 August 2026 · Granville Community Centre</p>
        </div>

        <div>
          <a href="mailto:Samir.m.raut72@gmail.com">
            Samir.m.raut72@gmail.com
          </a>

          <a href="tel:+61415950600">0415 950 600</a>
        </div>

        <Link className="adminLink" href="/admin">
          Admin
        </Link>
      </footer>
    </main>
  );
}