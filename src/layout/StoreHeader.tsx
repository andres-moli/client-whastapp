import React from "react";
import { ShoppingCart, User, Search } from "lucide-react";
import Button from "../components/ui/button/Button";
import { Outlet } from "react-router";

interface StoreHeaderProps {
  user?: { name: string } | null;
  cartCount?: number;
}

export default function StoreHeader({ user, cartCount = 0 }: StoreHeaderProps) {
  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm py-3 px-6 flex items-center justify-between w-full">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <img src="/images/logo/cytech-n-last.png" alt="Logo" className="h-12 w-auto" />
        </a>

        {/* Buscador con icono al lado */}
        <div className="flex-1 max-w-xl px-6 flex items-center gap-3">
          <Search className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="flex-grow px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow shadow-sm"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {/* Carrito */}
          <a href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>

          {/* Usuario */}
          {user ? (
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
              <User size={16} />
              <span>{user.name}</span>
            </div>
          ) : (
            <Button size="sm" onClick={() => (window.location.href = "/login")}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </header>

      {/* Contenido de las rutas hijas */}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}
