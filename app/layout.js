import "./globals.css";

export const metadata = {
  title: "Sat-Chit-Ananda | Kirtan Gathering",
  description:
    "An Intimate Kirtan Gathering Session at Granville Community Centre.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
