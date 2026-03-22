import { Lora } from "next/font/google";
import { AdminNav } from "./admin-nav";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: "400",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={lora.variable}>
      <AdminNav />
      {children}
    </div>
  );
}
