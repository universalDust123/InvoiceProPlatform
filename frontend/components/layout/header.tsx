"use client";

import { Search, User } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { NotificationBell } from "./notification-bell";

export function Header() {
  const { user } = useAuthContext();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        <NotificationBell />
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <User size={20} className="text-zinc-400" />
        </button>
      </div>
    </header>
  );
}
