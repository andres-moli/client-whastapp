import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useCallback, useEffect, useMemo, useState } from "react";

type SessionStatus = {
  connected: boolean;
  hasQR: boolean;
  qrAvailable: boolean;
};

const STATUS_ENDPOINT = `${import.meta.env.VITE_APP_GRAPH}about/sesion/status`;
const QR_ENDPOINT = `${import.meta.env.VITE_APP_GRAPH}about/sesion/qr`;
const POLL_MS = 5000;

const toBase64ImageSrc = (value: string) => {
  if (value.startsWith("data:image")) return value;
  return `data:image/png;base64,${value}`;
};

export default function SessionPage() {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const fetchQr = useCallback(async () => {
    try {
      setQrError(null);
      const response = await fetch(QR_ENDPOINT, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Error consultando QR (${response.status})`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      let base64 = "";

      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as {
          qr?: string;
          base64?: string;
          data?: string;
        };
        base64 = payload.qr ?? payload.base64 ?? payload.data ?? "";
      } else {
        base64 = (await response.text()).trim();
      }

      if (!base64) {
        setQrImageSrc(null);
        return;
      }

      setQrImageSrc(toBase64ImageSrc(base64.trim()));
    } catch {
      setQrImageSrc(null);
      setQrError("No se pudo cargar el codigo QR.");
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(STATUS_ENDPOINT, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Error consultando sesion (${response.status})`);
      }

      const data = (await response.json()) as SessionStatus;
      setStatus(data);
      setLastUpdate(new Date());
      if (data.hasQR) {
        await fetchQr();
      } else {
        setQrImageSrc(null);
        setQrError(null);
      }
    } catch {
      setError("No fue posible consultar el estado de la sesion.");
    } finally {
      setLoading(false);
    }
  }, [fetchQr]);

  useEffect(() => {
    fetchStatus();
    const intervalId = window.setInterval(fetchStatus, POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchStatus]);

  const statusLabel = useMemo(() => {
    if (!status) return "Sin datos";
    if (status.connected) return "Conectada";
    if (status.hasQR) return "Pendiente de escaneo";
    return "Desconectada";
  }, [status]);

  const statusTone = useMemo(() => {
    if (!status) return "bg-gray-100 text-gray-700";
    if (status.connected) return "bg-emerald-100 text-emerald-700";
    if (status.hasQR) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  }, [status]);

  const connectionLabel = status?.connected ? "Conectada" : "Desconectada";
  const qrLabel = status?.hasQR ? "QR listo para escanear" : "Sin QR activo";

  const connectionTone = status?.connected
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : "bg-rose-100 text-rose-700 border-rose-200";

  const qrTone = status?.hasQR
    ? "bg-cyan-100 text-cyan-700 border-cyan-200"
    : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div>
      <PageMeta
        title="Sesiones"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Sesiones" />
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-slate-50 via-white to-cyan-50 p-5 shadow-sm md:flex-row md:items-center md:justify-between dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estado de la sesion en tiempo real
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                  {statusLabel}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Actualiza cada 5 segundos
                </span>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Refrescar ahora
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`rounded-xl border p-4 ${connectionTone}`}>
              <p className="text-xs uppercase tracking-wide">Conexion</p>
              <p className="mt-2 text-lg font-semibold">{connectionLabel}</p>
            </div>
            <div className={`rounded-xl border p-4 ${qrTone}`}>
              <p className="text-xs uppercase tracking-wide">Estado QR</p>
              <p className="mt-2 text-lg font-semibold">{qrLabel}</p>
            </div>
          </div>

          {loading && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
              Consultando estado de la sesion...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
              {error}
            </div>
          )}

          {!loading && !error && status?.hasQR && qrImageSrc && (
            <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm dark:border-cyan-900/30 dark:bg-gray-900/60">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Escanea el codigo QR</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Escanea con el dispositivo para conectar la sesion.
              </p>
              <div className="mt-5 inline-flex rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                <img
                  src={qrImageSrc}
                  alt="QR de sesion"
                  className="h-64 w-64 rounded-lg object-contain"
                />
              </div>
            </div>
          )}
          {!loading && !error && status?.hasQR && qrError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
              {qrError}
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ultima actualizacion: {lastUpdate ? lastUpdate.toLocaleTimeString() : "sin datos"}
          </p>
        </div>
      </div>
    </div>
  );
}
