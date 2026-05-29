// chat/components/ChatSidebar.tsx
import { useState } from "react";

import { Search, MoreHorizontal } from "lucide-react";
import { Conversation } from "../types";
import dayjs from "dayjs";

export default function ChatSidebar({
  contacts,
  selectedContact,
  onSelect,
}: {
  contacts: Conversation[];
  selectedContact: Conversation | null;
  onSelect: (c: Conversation) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.customerNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex h-full w-full flex-col bg-white dark:bg-slate-950">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Clientes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Conversaciones disponibles</p>
          </div>
          <button className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors duration-200">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 min-h-0">
        {filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            className={`group mb-3 flex w-full items-center gap-3 rounded-[28px] border px-4 py-3 text-left transition-all duration-200 ${
              selectedContact?.id === c.id
                ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-500/10"
                : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={`/public/images/logo/sell-icon.png`}
                alt={c.customerNumber}
                className="h-14 w-14 rounded-full object-cover"
              />
              {/* {c.online && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
              )} */}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{c.customerNumber}</p>
                  {/* <p className="truncate text-sm text-slate-500 dark:text-slate-400 mt-1">{c.lastMessage}</p> */}
                </div>
                <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{dayjs(c.lastMessageTime).format("HH:mm")}</span>
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400 truncate">{c.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}