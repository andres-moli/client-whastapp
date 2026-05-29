import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Search } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
export const sellersData = [{
  id: 1,
  name: "Jhonatan ospina",
  phone: "573103320565",
  urlApi: "https://intranet.cytech.net.co:6001/api",
}]
export default function ChatSelector() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = sellersData.filter((seller) =>
    seller.name.toLowerCase().includes(search.toLowerCase()) || seller.phone.includes(search)
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 dark:bg-slate-950 pb-6 md:pb-8">
      <PageMeta title="Seleccionar Vendedor" description="Selecciona un vendedor para ver sus chats" />
      <PageBreadcrumb pageTitle="Seleccionar Vendedor" />

      <div className="mx-auto mt-4 max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_28px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Elegir vendedor</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Selecciona un vendedor para ver sus clientes y conversaciones actuales.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar vendedor..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((seller) => (
              <button
                key={seller.id}
                type="button"
                onClick={() => navigate(`/chat/${seller.phone}`)}
                className="group rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:bg-slate-900"
              >
                <div className="flex items-center gap-4">
                  <img
                    src="/public/images/logo/sell-icon.png"
                    alt={seller.name}
                    className="h-16 w-16 rounded-full object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{seller.name}</p>
                    {/* <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{seller.role}</p> */}
                  </div>
                  {/* <span className={`inline-flex h-3.5 w-3.5 rounded-full ${seller.online ? "bg-emerald-400" : "bg-slate-400"}`} /> */}
                </div>

                <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-slate-900">
                    <span>Teléfono</span>
                    <span className="font-medium text-slate-900 dark:text-white">{seller.phone}</span>
                  </div>
                  {/* <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-slate-900">
                    <span>Clientes</span>
                    <span className="font-medium text-slate-900 dark:text-white">{seller.clients.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-slate-900">
                    <span>Mensajes sin responder</span>
                    <span className="font-medium text-slate-900 dark:text-white">{seller.mensajesNotResponse}</span>
                  </div> */}
                </div>

                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <span>Ver chats del vendedor</span>
                  <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
