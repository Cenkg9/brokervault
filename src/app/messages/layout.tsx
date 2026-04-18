import Navbar from "@/components/layout/Navbar";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
