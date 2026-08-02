import Link from "next/link";
import { notFound } from "next/navigation";

const artists = {
  "rozan-subedi": {
    name: "Rozan Subedi",
    role: "Keyboard",
    image: "/artists/rozan-subedi1.jpg",
    introduction:
      "Rojan Subedi is a passionate and versatile keyboardist whose musical foundation was laid in Grade 7 under the formal mentorship of instructor Rohit KC. What started as early lessons quickly evolved into years of dedicated practice and live performance across Nepal, where Rojan has graced stages with various local bands and musical projects. Defined by a deep, open-minded love for every genre—ranging from classic rock and mainstream pop to complex fusion and ambient textures—he is known for his keen musical ear, dynamic stage presence, and ability to seamlessly blend into any soundscape. Whether crafting soaring synth solos, providing rich harmonic backdrops, or improvising live on the spot, Rojan brings both technical skill and creative passion to every performance he touches",
  },

  aadesh: {
    name: "Aadesh",
    role: "Singer/Song-writer",
    image: "/artists/aadesh1.jpg",
    introduction: `Aadesh is a Kathmandu-born, Sydney-based singer-songwriter whose sound sits at the intersection of soulful storytelling and deep reflection. His musical journey began at home under the guidance of his mother, laying a rich foundational grounding that he later expanded through years of self-taught exploration across genres.

A seeker and meditator at heart, Aadesh infuses his work with a spiritual depth that makes his versatile voice uniquely his own. After winning over audiences on Nepal Idol, he brought his music to stages across Australia and Nepal, touring and performing alongside notable artists.

Beyond his work as the lead male vocalist for Sat-Chit-Ānanda and a founding member of Project Beyond, Aadesh is currently focused on his evolving catalogue of original music. Whether performing intimate live shows across Sydney or crafting new songs in the studio, his focus remains singular: creating honest, soulful music that connects deeply with the human experience.`,
  },

  "sabin-ghising": {
    name: "Sabin Ghising",
    role: "Flute and Electronic Wind Instrument",
    image: "/artists/sabin-ghising1.jpg",
    introduction:
      "Sabin Ghising is a Kathmandu-born Nepalese flutist based in Sydney. He began his musical journey in 2014, training in Eastern classical music under Shri Nagendra Rai and Western flute under Mr. Tomas Carrasco, while also completing a two-year jazz diploma. Proficient in Bansuri, Western flute and Electronic Wind Instrument (EWI), his work seamlessly blends Eastern traditions with contemporary and jazz influences.\n\nWith over a decade of experience, Sabin has performed, toured, recorded and collaborated across diverse musical genres and communities. He has toured extensively across Australia and performed at prestigious venues including the Sydney Opera House and the Sydney Conservatorium of Music. Sabin has captured the love of audiences across Australia through his mastery of the flute, blending Eastern classical, jazz and global sounds. His performances have been described as mesmerising, divine and peaceful. Sabin currently works as a freelance performer, educator and session artist.",
  },

  "nischal-bista": {
    name: "Nischal Bista",
    role: "Kirtan Artist",
    image: "/artists/nischal-bista1.jpg",
    introduction:
      "Nischal Bista is a featured artist performing at Sat-Chit-Ānanda. His introduction and musical journey will be added soon.",
  },

  "anjuli-hamal": {
    name: "Anjuli Hamal",
    role: "Kirtan Artist",
    image: "/artists/anjuli-hamal1.jpg",
    introduction:
      "Anjuli Hamal is a featured artist performing at Sat-Chit-Ānanda. Her introduction and musical journey will be added soon.",
  },

  "om-b-shrestha": {
    name: "Om B Shrestha",
    role: "Drummer and Percussionist",
    image: "/artists/om-b-shrestha1.jpg",
    introduction: `Driven by rhythm, versatility and passion, Omchaa Drums has been crafting his sound since 2008. His musical journey began under the guidance of his father—his first drum teacher and foundational influence—before honing his craft at the Nepal Music Centre under respected mentor Sanjog Pradhan. While deeply rooted as a rock drummer, his curiosity expanded into world percussion, leading him to master instruments including the Tabla, Madal, Djembe, Darbuka and Cajón.

A milestone in his technical and artistic development came with achieving a Distinction in Rockschool UK Grade 8. In 2020, Omchaa joined The Aerials Nepal, becoming an active force in Nepal’s vibrant rock scene.

Since relocating to Australia in 2023, he has established himself as a versatile live and session drummer and percussionist. He has collaborated and performed with prominent acts and artists, including Kuma Sagar, Wangden Sherpa, Albatross and Abhaya & The Steam Engines.

Currently performing with Project Beyond, Omchaa Drums continues to explore new sonic landscapes, cross-genre collaborations and international opportunities. From his early beats in Nepal to stages across Australia, music remains his ultimate form of expression.`,
  },

  "aantariksha-dahal": {
    name: "Aantariksha Dahal",
    role: "Kirtan Artist",
    image: "/artists/aantariksha-dahal1.jpg",
    introduction:
      "Aantariksha Dahal is a featured artist performing at Sat-Chit-Ānanda. The artist introduction and musical journey will be added soon.",
  },
};

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
          <span>Sat-Chit-Ānanda</span>
        </Link>

        <Link className="navButton" href="/#artists">
          All Artists
        </Link>
      </header>

      <section className="artistProfileHero">
        <div className="artistProfileImage">
          <img
            src={artist.image}
            alt={`${artist.name} at Sat-Chit-Ānanda`}
          />
        </div>

        <div className="artistProfileContent">
          <Link className="artistBackButton" href="/#artists">
            ← Back to Artists
          </Link>

          <p className="sectionEyebrow gold">Featured artist</p>

          <h1>{artist.name}</h1>

          <p className="artistRole">{artist.role}</p>

          <div className="artistIntroduction">
            {paragraphs.map((paragraph, index) => (
              <p key={`${artist.name}-${index}`}>{paragraph}</p>
            ))}
          </div>

          <div className="heroActions">
            <Link className="primaryButton" href="/register">
              Reserve Your Place
            </Link>

            <Link className="secondaryButton" href="/#artists">
              Back to Artists
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}