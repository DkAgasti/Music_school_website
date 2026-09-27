import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { apiGetSiteSettings } from "@/Api/public/siteSettingsApi";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us - Synchrocity Music School",
  description: "Get in touch with Synchrocity Music School — visit us, call, or send a message.",
};

export default async function ContactPage() {
  const settings = await apiGetSiteSettings();

  return (
    <>
      <Navbar />
      <ContactClient settings={settings} />
      <Footer />
    </>
  );
}
