import WhatsAppButton from "@/components/public/WhatsAppButton";
import { AdmissionProvider } from "@/context/AdmissionContext";
import AdmissionModal from "@/components/public/AdmissionModal";

export default function PublicLayout({ children }) {
  return (
    <AdmissionProvider>
      {children}
      <AdmissionModal />
      <WhatsAppButton />
    </AdmissionProvider>
  );
}
