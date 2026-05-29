// chat/components/MessageList.tsx

import { useEffect, useRef } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode2,
  FileAudio,
  FileImage,
  FileVideo,
  Download,
} from "lucide-react";

import { Message } from "../hooks/useChat";

export default function MessageList({
  messages,
}: {
  messages: Message[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // ICONO SEGÚN MIMETYPE
  // =========================

  const renderFileIcon = (mimetype?: string) => {
    if (!mimetype) {
      return <FileText className="h-7 w-7 text-slate-500" />;
    }

    // PDF
    if (mimetype === "application/pdf") {
      return <FileText className="h-7 w-7 text-red-500" />;
    }

    // WORD
    if (
      mimetype === "application/msword" ||
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileText className="h-7 w-7 text-blue-500" />;
    }

    // EXCEL
    if (
      mimetype === "application/vnd.ms-excel" ||
      mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimetype === "text/csv"
    ) {
      return (
        <FileSpreadsheet className="h-7 w-7 text-green-500" />
      );
    }

    // XML
    if (mimetype === "application/xml") {
      return <FileCode2 className="h-7 w-7 text-orange-500" />;
    }

    // ZIP
    if (
      mimetype === "application/zip" ||
      mimetype.includes("zip") ||
      mimetype.includes("rar")
    ) {
      return (
        <FileArchive className="h-7 w-7 text-yellow-500" />
      );
    }

    // AUDIO
    if (mimetype.startsWith("audio/")) {
      return <FileAudio className="h-7 w-7 text-purple-500" />;
    }

    // VIDEO
    if (mimetype.startsWith("video/")) {
      return <FileVideo className="h-7 w-7 text-pink-500" />;
    }

    // IMAGE
    if (mimetype.startsWith("image/")) {
      return <FileImage className="h-7 w-7 text-cyan-500" />;
    }

    // DEFAULT
    return <FileText className="h-7 w-7 text-slate-500" />;
  };

  // =========================
  // VALIDACIONES MIME
  // =========================

  const isImage = (mimetype?: string) =>
    mimetype?.startsWith("image/");

  const isAudio = (mimetype?: string) =>
    mimetype?.startsWith("audio/");

  const isVideo = (mimetype?: string) =>
    mimetype?.startsWith("video/");

  return (
    <div
      ref={ref}
      className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-4 bg-slate-50 dark:bg-slate-950"
    >
      {messages.length === 0 ? (
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-200 bg-white/80 text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
          <p className="text-lg font-medium">
            Selecciona un chat para comenzar
          </p>

          <p className="text-sm">
            Tus conversaciones aparecerán aquí con diseño moderno y
            scroll suave.
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-xl rounded-[28px] px-5 py-4 shadow-sm transition-all duration-200
                ${
                  msg.sender === "me"
                    ? "bg-blue-600 text-white shadow-blue-200/20"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-slate-200/60 dark:shadow-slate-950/40"
                }
              `}
            >
              {/* TEXTO */}
              {msg.type === "text" && (
                <p className="text-sm leading-7">
                  {msg.text}
                </p>
              )}

              {/* IMAGEN POR MIMETYPE */}
              {isImage(msg.mimetype) && msg.file && (
                <img
                  src={msg.file}
                  alt={msg.fileName || "Imagen"}
                  className="max-w-full rounded-2xl shadow-sm"
                />
              )}

              {/* AUDIO POR MIMETYPE */}
              {isAudio(msg.mimetype) && msg.file && (
                <audio
                  controls
                  src={msg.file}
                  className="mt-2 w-full rounded-2xl"
                />
              )}

              {/* VIDEO POR MIMETYPE */}
              {isVideo(msg.mimetype) && msg.file && (
                <video
                  controls
                  src={msg.file}
                  className="mt-2 max-w-full rounded-2xl"
                />
              )}

              {/* DOCUMENTOS */}
              {!isImage(msg.mimetype) &&
                !isAudio(msg.mimetype) &&
                !isVideo(msg.mimetype) &&
                msg.file && (
                  <a
                    href={msg.file}
                    target="_blank"
                    rel="noreferrer"
                    className={`
                      mt-2 flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all
                      ${
                        msg.sender === "me"
                          ? "border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    {/* ICONO */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                      {renderFileIcon(msg.mimetype)}
                    </div>

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {msg.fileName || "Documento"}
                      </p>

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {msg.mimetype || "Archivo"}
                      </p>
                    </div>

                    {/* DESCARGA */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 dark:bg-slate-800">
                      <Download className="h-5 w-5" />
                    </div>
                  </a>
                )}

              {/* HORA */}
              <p
                className={`
                  mt-3 text-[11px]
                  ${
                    msg.sender === "me"
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }
                `}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}