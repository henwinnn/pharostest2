import "./globals.css";
import App from "./App";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        <App>

        {children}
        </App>
      </body>
    </html>
  );
}
