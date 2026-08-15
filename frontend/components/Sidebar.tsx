"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, GitCommitVertical, Activity,
  Pill, Search, MessageCircle, LogOut,
} from "lucide-react";
import { clearToken } from "@/lib/api";
import SoundToggle from "@/components/SoundToggle";
import { playNav } from "@/lib/sound";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/timeline", label: "Timeline", icon: GitCommitVertical },
  { href: "/conditions", label: "Conditions", icon: Activity },
  { href: "/treatments", label: "Treatments", icon: Pill },
  { href: "/search", label: "Search", icon: Search },
  { href: "/assistant", label: "AI Assistant", icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="md:w-60 md:min-h-screen md:border-r border-border bg-surface flex md:flex-col shrink-0">
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <span className="text-white font-display text-sm">M</span>
          </div>
          <span className="font-display text-[17px] tracking-tight">MedTrace AI</span>
        </div>
        <div className="hidden md:block trace-hairline mt-4" aria-hidden="true" />
      </div>

      <nav className="hidden md:flex flex-col gap-0.5 px-3 flex-1">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={playNav}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-accent-soft text-accent-strong font-medium" : "text-ink-muted hover:bg-bg hover:text-ink"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.25 : 1.75} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex flex-col gap-2 p-3 border-t border-border">
        <SoundToggle className="px-3 py-1" />
        <button
          onClick={() => { clearToken(); router.push("/login"); }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-status-danger hover:bg-status-dangerSoft transition-colors w-full"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Log out
        </button>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between w-full px-4 py-3">
        <div className="flex gap-1 overflow-x-auto">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}
                className={`px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap ${active ? "bg-accent-soft text-accent-strong font-medium" : "text-ink-muted"}`}>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
