import "./globals.css";

export const metadata = {
  title: "Derpo",
  description: "derpo",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
