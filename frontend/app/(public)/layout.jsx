import WhatsAppButton from "@/components/public/WhatsAppButton";

export default function PublicLayout({ children }) {
  return (
    <>
      {children}
      <WhatsAppButton />
    </>
  );
}
