import React, { useState } from "react";
import { User, Lock } from "lucide-react";

export default function LoginStore() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/home-store";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900">
      {/* Imagen a la izquierda */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')",
        }}
      />

      {/* Formulario de login */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-8 md:p-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/images/logo/cytech-n-last.png" alt="Cytech Store" className="h-12" />
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
            Bienvenido a la tienda
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                autoComplete="current-password"
              />
            </div>

            {/* Olvidé contraseña */}
            <div className="text-right text-sm">
              <a
                href="/forgot-password"
                className="text-brand-600 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-md transition"
            >
              Entrar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              className="text-brand-600 hover:underline font-semibold"
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
