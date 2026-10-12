import "@/styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_NAME = "FoodRescue";
const DESCRIPTION =
  "FoodRescue connects food donors with verified NGOs and volunteers so safe surplus food reaches people instead of going to waste.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${SITE_NAME} – Turn Surplus Food Into Shared Meals`, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { title: SITE_NAME, description: DESCRIPTION, siteName: SITE_NAME, type: "website" },
};

export const viewport = { themeColor: "#15803d" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AuthProvider>
          <Navbar />
          <div id="main" style={{ flex: 1 }}>{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
