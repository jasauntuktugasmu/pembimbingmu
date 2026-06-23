import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, LogOut, PenSquare } from "lucide-react";

export default function WriterLayout() {
  const { signOut, profile } = useAuth();
  const items = [
    { to: "/writer", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/writer/articles", icon: FileText, label: "Artikel Saya" },
    { to: "/writer/articles/new", icon: PenSquare, label: "Tulis Baru" },
  ];
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#81b59a] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-bold">Writer Panel</h1>
          <p className="text-xs text-white/80 truncate">{profile?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition ${isActive ? "bg-white/20" : "hover:bg-white/10"}`}>
              <it.icon className="h-4 w-4" /> <span className="text-sm">{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 hover:text-white" onClick={() => signOut()}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-background overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
