import Link from "next/link";
import { notFound } from "next/navigation";

const artists = {
  "rozan-subedi": {
    name: "Rozan Subedi",
    role: "Keyboard",
    image: "/artists/rozan-subedi1.jpg",
    instagram: "https://www.instagram.com/rojazzzz99/",
    introduction: `Rojan Subedi is a passionate and versatile keyboardist whose musical foundation was laid in Grade 7 under the formal mentorship of instructor Rohit KC. What started as early lessons quickly evolved into years of dedicated practice and live performance across Nepal, where Rojan has graced stages with various local bands and musical projects.

Defined by a deep, open-minded love for every genre—ranging from classic rock and mainstream pop to complex fusion and ambient textures—he is known for his keen musical ear, dynamic stage presence, and ability to seamlessly blend into any soundscape.

Whether crafting soaring synth solos, providing rich harmonic backdrops, or improvising live on the spot, Rojan brings both technical skill and creative passion to every performance he touches.`,
  },

  aadesh: {
    name: "Aadesh",
    role: "Lead Male Vocal",
    image: "/artists/aadesh1.jpg",
    instagram: "https://www.instagram.com/aadesh_poudel/",
    tiktok: "https://www.tiktok.com/@aadeshpoudel01",
    introduction: `Aadesh is a Kathmandu-born, Sydney-based singer-songwriter whose sound sits at the intersection of soulful storytelling and deep reflection. His musical journey began at home under the guidance of his mother, laying a rich foundational grounding that he later expanded through years of self-taught exploration across genres.

A seeker and meditator at heart, Aadesh infuses his work with a spiritual depth that makes his versatile voice uniquely his own. After winning over audiences on Nepal Idol, he brought his music to stages across Australia and Nepal, touring and performing alongside notable artists.

Beyond his work as the lead male vocalist for Sat-Chit-\u0100nanda and a founding member of Project Beyond, Aadesh is currently focused on his evolving catalogue of original music. Whether performing intimate live shows across Sydney or crafting new songs in the studio, his focus remains singular: creating honest, soulful music that connects deeply with the human experience.`,
  },

  "sabin-ghising": {
    name: "Sabin Ghising",
    role: "Flute and Electronic Wind Instrument",
    image: "/artists/sabin-ghising1.jpg",
    instagram: "https://www.instagram.com/sabin8350/",
    tiktok: "https://www.tiktok.com/@sabinghising70",
    introduction: `Sabin Ghising is a Kathmandu-born Nepalese flutist based in Sydney. He began his musical journey in 2014, training in Eastern classical music under Shri Nagendra Rai and Western flute under Mr. Tomas Carrasco, while also completing a two-year jazz diploma. Proficient in Bansuri, Western flute and Electronic Wind Instrument (EWI), his work seamlessly blends Eastern traditions with contemporary and jazz influences.

With over a decade of experience, Sabin has performed, toured, recorded and collaborated across diverse musical genres and communities. He has toured extensively across Australia and performed at prestigious venues including the Sydney Opera House and the Sydney Conservatorium of Music.

Sabin has captured the love of audiences across Australia through his mastery of the flute, blending Eastern classical, jazz and global sounds. His performances have been described as mesmerising, divine and peaceful. Sabin currently works as a freelance performer, educator and session artist.`,
  },

  "nischal-bista": {
    name: "Nischal Bista",
    role: "Bassist",
    image: "/artists/nischal-bista1.jpg",
    instagram: "https://www.instagram.com/nischalbista/",
    tiktok: "https://www.tiktok.com/@nischal.bista5",
    introduction: `Nischal Bista’s relationship with music spans over 24 years, anchored by a deep-rooted connection to the bass guitar. Starting at sixteen, learning basic chords while hauling equipment for local bands, Nischal carved out his own path by choosing the low frequencies of the bass over the traditional guitar.

Through changing chapters, evolving bands, and life’s unpredictable beats, his instrument has remained a constant anchor. Today, Nischal creates, records, and performs with a voice built on authentic emotion and decades of dedicated storytelling.`,
  },

  "anjuli-hamal": {
    name: "Anjuli Hamal",
    role: "Lead Female Vocal / Harmonium",
    image: "/artists/anjuli-hamal1.jpg",
    instagram: "https://www.instagram.com/anjuli_hamal/",
    tiktok: "https://www.tiktok.com/@anjulihamal7",
    introduction: `Anjuli Hamal is a vocalist, songwriter, and worship music artist proudly carrying the spirit and stories of Karnali, Nepal. Rooted in her culture and deeply connected to music, she found her calling in expressing emotions, devotion, and life through her voice and songwriting.

Anjuli has been devoted to the study of classical music, training under the guidance of Guru Sanjeev Aale Magar for the past four years and continuing her musical journey under his mentorship. Her classical foundation has shaped her vocal discipline, musical expression, and understanding of the depth and beauty of music.

Currently based in Australia, Anjuli is pursuing her musical dreams while continuing to grow as an artist. Her journey is one of dedication, faith, cultural roots, and an unwavering love for music.

Through her voice and songs, Anjuli hopes to connect with people, preserve the essence of where she comes from, and create music that touches hearts and carries meaning beyond borders.`,
  },

  "om-b-shrestha": {
    name: "Om B Shrestha",
    role: "Drummer and Percussionist",
    image: "/artists/om-b-shrestha1.jpg",
    instagram: "https://www.instagram.com/omchaa_drums/",
    introduction: `Driven by rhythm, versatility and passion, Omchaa Drums has been crafting his sound since 2008. His musical journey began under the guidance of his father—his first drum teacher and foundational influence—before honing his craft at the Nepal Music Centre under respected mentor Sanjog Pradhan. While deeply rooted as a rock drummer, his curiosity expanded into world percussion, leading him to master instruments including the Tabla, Madal, Djembe, Darbuka and Cajón.

A milestone in his technical and artistic development came with achieving a Distinction in Rockschool UK Grade 8. In 2020, Omchaa joined The Aerials Nepal, becoming an active force in Nepal’s vibrant rock scene.

Since relocating to Australia in 2023, he has established himself as a versatile live and session drummer and percussionist. He has collaborated and performed with prominent acts and artists, including Kuma Sagar, Wangden Sherpa, Albatross and Abhaya & The Steam Engines.

Currently performing with Project Beyond, Omchaa Drums continues to explore new sonic landscapes, cross-genre collaborations and international opportunities. From his early beats in Nepal to stages across Australia, music remains his ultimate form of expression.`,
  },

  "aantariksha-dahal": {
    name: "Aantariksha Dahal",
    role: "Guitarist",
    image: "/artists/aantariksha-dahal1.jpg",
    instagram: "https://www.instagram.com/antarikshadahal/",
    introduction: `Antariksha’s love for music began in childhood, long before he ever picked up a real guitar. After years of playing “air guitar,” he started learning guitar in 2016 and soon formed a band with friends, performing at cafés and venues across Biratnagar, Nepal.

In 2019, he co-founded the original rock band Mrityunjaya Nepal, dedicated to creating original music and reviving the local rock scene. Together, they helped establish Yogi’s Rock Bar, organized numerous live performances, founded a music institute where each band member taught their area of expertise, and later built MTJ Pub—a space where music, creativity, and community come together.

Along the way, he also collaborated with artists such as Shaurav Bhattarai.`,
  },
};

function InstagramIcon() {
  return (
    <svg
      className="instagramSocialIcon"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient
          id="instagramGradient"
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
        fill="url(#instagramGradient)"
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

      <circle cx="32.5" cy="15.8" r="2" fill="#ffffff" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      className="tiktokSocialIcon"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M27.5 8v21.3a8.7 8.7 0 1 1-7.3-8.6v5.3a3.6 3.6 0 1 0 2.1 3.3V8h5.2c.7 4.4 3.2 7 7.5 8.5v5.2a14.2 14.2 0 0 1-7.5-3.1V8Z"
        fill="none"
        stroke="#25f4ee"
        strokeWidth="5"
        strokeLinejoin="round"
        transform="translate(-1.5, 1.5)"
      />

      <path
        d="M27.5 8v21.3a8.7 8.7 0 1 1-7.3-8.6v5.3a3.6 3.6 0 1 0 2.1 3.3V8h5.2c.7 4.4 3.2 7 7.5 8.5v5.2a14.2 14.2 0 0 1-7.5-3.1V8Z"
        fill="none"
        stroke="#fe2c55"
        strokeWidth="5"
        strokeLinejoin="round"
        transform="translate(1.5, -1.5)"
      />

      <path
        d="M27.5 8v21.3a8.7 8.7 0 1 1-7.3-8.6v5.3a3.6 3.6 0 1 0 2.1 3.3V8h5.2c.7 4.4 3.2 7 7.5 8.5v5.2a14.2 14.2 0 0 1-7.5-3.1V8Z"
        fill="#111111"
      />
    </svg>
  );
}

export function generateStaticParams() {
  return Object.keys(artists).map((slug) => ({
    slug,
  }));
}

export default async function ArtistProfilePage({ params }) {
  const { slug } = await params;
  const artist = artists[slug];

  if (!artist) {
    notFound();
  }

  const paragraphs = artist.introduction
    .split("\n\n")
    .filter((paragraph) => paragraph.trim());

  return (
    <main className="artistProfilePage">
      <header className="siteHeader">
        <Link className="brand" href="/">
          <span className="brandMark">ॐ</span>
          <span>Sat-Chit-{"\u0100"}nanda</span>
        </Link>

        <Link className="navButton" href="/#artists">
          All Artists
        </Link>
      </header>

      <section className="artistProfileHero">
        <div className="artistProfileImage">
          <img
            src={artist.image}
            alt={`${artist.name} at Sat-Chit-\u0100nanda`}
          />
        </div>

        <div className="artistProfileContent">
          <Link className="artistBackButton" href="/#artists">
            ← Back to Artists
          </Link>

          <p className="sectionEyebrow gold">
            Featured artist
          </p>

          <h1>{artist.name}</h1>

          <p className="artistRole">
            {artist.role}
          </p>

          <div className="artistIntroduction">
            {paragraphs.map((paragraph, index) => (
              <p key={`${artist.name}-${index}`}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="artistSocialLinks">
            {artist.instagram && (
              <a
                className="artistSocialIconLink"
                href={artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${artist.name} Instagram`}
                title={`${artist.name} on Instagram`}
              >
                <InstagramIcon />
              </a>
            )}

            {artist.tiktok && (
              <a
                className="artistSocialIconLink"
                href={artist.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${artist.name} TikTok`}
                title={`${artist.name} on TikTok`}
              >
                <TikTokIcon />
              </a>
            )}
          </div>

          <div className="heroActions">
            <Link className="primaryButton" href="/register">
              Reserve a Spot
            </Link>

            <Link className="artistBackButton" href="/#artists">
              ← Back to Artists
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}