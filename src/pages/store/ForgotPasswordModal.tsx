import React, { useState } from "react";
import Swal from "sweetalert2";

interface ForgotPasswordModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (email: string, nit: string) => Promise<void>;
}

export default function ForgotPasswordModal({
    open,
    onClose,
    onSubmit,
}: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");
    const [nit, setNit] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!email || !nit) {
            Swal.fire({
                icon: "warning",
                title: "Campos requeridos",
                text: "Por favor, ingresa tu correo y NIT.",
            });
            return;
        }

        setLoading(true);
        try {
            await onSubmit(email, nit);
            Swal.fire({
                icon: "success",
                title: "Correo enviado",
                text: "Te hemos enviado un enlace para restablecer tu contraseña, a tu correo. Rebice",
            });
            onClose();
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No pudimos enviar el correo. Verifica tus datos.",
            });
        } finally {
            setLoading(false);
        }


    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
                    Recuperar contraseña
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
                    Ingresa tu correo y NIT registrados para recibir un enlace de recuperación.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                        placeholder="ejemplo@correo.com"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        NIT o número de documento
                    </label>
                    <input
                        type="text"
                        value={nit}
                        onChange={(e) => setNit(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                        placeholder="123456789-0"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-md transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Enviando..." : "Enviar enlace"}
                    </button>
                </div>
            </div>
        </div>


    );
}