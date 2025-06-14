import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { ToastyErrorGraph } from "../../lib/utils";
import { useUpdateBundleMutation, useBundleQuery, WsBatchDetail, WsBatchStatus, FileInfo, ResendOption, useSendLoteMessagesByOptionMutation, WsCell, useSendLoteMessagesByIdMutation, TypeBundleEnum } from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import TextArea from "../../components/form/input/TextArea";
import { WhatsAppMessageEditor } from "../../components/form/WhatsAppMessageEditor";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { BundleDetailTable } from "./BundleDetailTable";
import { FileIcon, Trash2Icon } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { ProgressBar } from "./loadingProcess";
import Button from "../../components/ui/button/Button";
import FileInput from "../../components/form/input/FileInput";
import handleUploadImage from "../../lib/uptloadFile";

export const UpdateBundlePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [update] = useUpdateBundleMutation();
  const [send] = useSendLoteMessagesByIdMutation();
  const [resendLoteMessages] = useSendLoteMessagesByOptionMutation();
  const { data, loading, refetch } = useBundleQuery({ variables: { bundleId: id || "" }, fetchPolicy: 'no-cache' });

  const bundle = data?.bundle;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [nameGroup, setNameGroup] = useState("");
  const [file, setFile] = useState<FileInfo>();
  const [estado, setEstado] = useState<WsBatchStatus>();
  const [detail, setDetail] = useState<WsBatchDetail[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inputKey, setInputKey] = useState(Date.now()); // Forzar reinicio
  const [fileNew, setFileNew] = useState<React.ChangeEvent<HTMLInputElement>>();
  const [progress, setProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);
  const [tipoLote, setTipoLote] = useState<TypeBundleEnum>(TypeBundleEnum.Whastapp);
  useEffect(() => {
    if (bundle) {
      setName(bundle.nombre);
      setDescription(bundle?.descripcion || '');
      setMessage(bundle.message || '');
      setNameGroup(bundle.group?.nombre || 'Sin Grupo');
      setEstado(bundle.estado);
      setFile(bundle.file || undefined);
      setTipoLote(bundle.type || TypeBundleEnum.Whastapp);
      //@ts-ignore
      setDetail(bundle.detalles || []);
    }
  }, [bundle]);
  useEffect(() => {
    if (!id) return;

    // 1. Recuperar estado anterior del localStorage
    const savedProgress = localStorage.getItem(`progress-${id}`);
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setProgress(parsedProgress);
      } catch (e) {
        console.error("Error parsing saved progress", e);
      }
    }

    const savedLogs = localStorage.getItem(`logs-${id}`);
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        setLogs(parsedLogs);
      } catch (e) {
        console.error("Error parsing saved logs", e);
      }
    }
    const url = import.meta.env.VITE_APP_GRAPH_WHASTAPP_WS + 'ws';
    // 2. Establecer conexión WebSocket
    const newSocket = io(url, {
      transports: ["websocket"],
      query: { bundleId: id },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("📡 Conectado al socket");
      newSocket.emit('subscribe', { bundleId: id });

      // 3. Verificar si hay progreso guardado para sincronizar
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        console.log("Recuperando progreso guardado:", parsedProgress);
        setProgress(parsedProgress);
      }
    });

    newSocket.on("log", (data: { message: string }) => {
      refetch()
      console.log("📡 Log recibido:", data.message);
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, data.message];

        // Guardar en localStorage
        localStorage.setItem(`logs-${id}`, JSON.stringify(newLogs));

        return newLogs;
      });
    });

    newSocket.on("progress", (progress: { current: number; total: number; percentage: number }) => {
      console.log(`Progreso: ${progress.current}/${progress.total} (${progress.percentage}%)`);
      setProgress(progress);

      // Guardar en localStorage
      localStorage.setItem(`progress-${id}`, JSON.stringify(progress));
    });

    // 4. Limpieza al desmontar el componente
    return () => {
      newSocket.disconnect();

      // Opcional: Limpiar localStorage cuando el proceso esté completo
      if (progress?.percentage === 100) {
        localStorage.removeItem(`progress-${id}`);
        localStorage.removeItem(`logs-${id}`);
      }
    };
  }, [id]);

  // 5. Efecto adicional para limpiar datos obsoletos
  useEffect(() => {
    return () => {
      // Limpiar datos al desmontar el componente si el proceso no está completo
      if (progress?.percentage !== 100 && id) {
        localStorage.removeItem(`progress-${id}`);
        localStorage.removeItem(`logs-${id}`);
      }
    };
  }, [progress, id]);

  const handleSendOneCell = async (cellId: string, cellNumber: string) => {
    let toastId: string | number | undefined = undefined;
    try {
      const confirm = await Swal.fire({
        title: `¿Estas seguro que deseas enviar este unico mensaje al celular ${cellNumber}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
      });

      if (confirm.dismiss) {
        return;
      }

      if (confirm.isConfirmed) {
        toastId = toast.loading("Enviando mensaje...");
        const res = await send({
          variables: {
            bundleId: bundle?.id!,
            cellId: cellId,
          },
        });

        if (res.errors) {
          toast.error("Error: " + res.errors[0].message);
          return;
        }
        if (res.data?.sendLoteMessagesById.success) {
          toast.success("Mensaje enviado exitosamente");
        }
        if (!res.data?.sendLoteMessagesById.success) {
          toast.error("Error: " + res.data?.sendLoteMessagesById.message);
        }
        refetch();
      }
    } catch (err) {
      ToastyErrorGraph(err as any);
    } finally {
      toast.dismiss(toastId);
    }
  };
  const handleUpdate = async () => {
    try {
      const confirm = await Swal.fire({
        title: "¿Actualizar lote?",
        text: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar"
      });

      if (!confirm.isConfirmed) return;
      let fileId: null | string = null
      if (fileNew) {
        if (fileNew?.target?.files?.[0]) {
          const dataFile = await handleUploadImage(fileNew?.target?.files?.[0])
          fileId = dataFile?.id || ''
        } else {
          toast.error('No se selecionaste un archivo para subir')
          return
        }
      }
      const res = await update({
        variables: {
          updateInput: {
            id: bundle?.id!,
            nombre: name,
            descripcion: description,
            message: message,
            fileId: fileId ? fileId : undefined
          }
        }
      });

      if (res.errors) {
        toast.error("Error al actualizar: " + res.errors[0].message);
        return;
      }

      apolloClient.cache.evict({ fieldName: "bundles" });
      toast.success("Lote actualizado correctamente");
      refetch()
    } catch (err) {
      ToastyErrorGraph(err as any);
    }
  };
  const handleResend = async (option: ResendOption) => {
    try {
      const confirm = await Swal.fire({
        title: "¿Enviar lote?",
        text: "¿Deseas enviar este lote?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, Enviar",
        cancelButtonText: "Cancelar"
      });
      if (confirm.isConfirmed) {
        const res = await resendLoteMessages({
          variables: {
            option,
            sendLoteMessagesByOptionId: bundle?.id!,
          },
        });
        if (res.data?.sendLoteMessagesByOption.success) {
          await refetch();
          Swal.fire({
            title: "Éxito",
            text: "Lote enviado correctamente",
            icon: "success",
            confirmButtonText: "Aceptar"
          });
          return
        }
        else {
          Swal.fire({
            title: "No se pudo enviar el lote",
            text: res.data?.sendLoteMessagesByOption.message,
            icon: "error",
            confirmButtonText: "Aceptar"
          });
          return
        }
      }
    } catch (error) {
      toast.error("Error al reenviar los mensajes");
    }
  };
  const deleteFile = async () => {
    const res = await update({
      variables: {
        updateInput: {
          id: bundle?.id!,
          deleteFile: true,
        }
      }
    });
    if (res.errors) {
      toast.error("Error al eliminar el archivo: " + res.errors[0].message);
      return;
    }
    toast.success("Archivo eliminado correctamente");
    setFile(undefined); // Quita el archivo del estado local
    refetch(); // Refresca la información del lote
  }
  const onDeleteFile = () => {
    setFile(undefined)
    setInputKey(Date.now()); // Cambia la key para reiniciar el input
    toast.success('Archivo eliminado con exitó')
  }
  if (loading) return <p className="p-4">Cargando información del lote...</p>;
  if (!bundle) return <p className="p-4 text-red-600">No se encontró el lote.</p>;

  return (
    <div>
      <PageMeta
        title={loading ? 'cargando...' : `Actualizar lote ${bundle.nombre}`}
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Lotes detalle " />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Detalle del lote
        </h3>

        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Nombre del lote
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <label className="mt-4 mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Descripción del lote
        </label>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e)}
          className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Grupo</label>
        <input
          type="text"
          value={nameGroup}
          disabled
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
        <input
          type="text"
          value={estado}
          disabled
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        {file && (
          <div className="mt-2 flex items-center gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <FileIcon /> {file.fileName}
            </a>
            <button
              className="text-red-500 hover:underline text-xs"
              onClick={() => {
                Swal.fire({
                  title: "¿Eliminar archivo?",
                  text: "Esta acción eliminará el archivo adjunto del lote.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Sí, eliminar",
                  cancelButtonText: "Cancelar",
                }).then((result) => {
                  if (result.isConfirmed) {
                    deleteFile();
                  }
                });
              }}
            >
              Eliminar archivo
            </button>
          </div>
        )}
        {
          !file && (
            <div className="mt-2 flex items-center gap-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Subir archivo
              </label>
              {file && (
                <Trash2Icon className="mb-1.5 block cursor-pointer" onClick={onDeleteFile} />
              )}
              <FileInput
                key={inputKey.toString()} // Cambia la key para forzar el reinicio
                onChange={(e) => setFileNew(e)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          )
        }
        {
          tipoLote === TypeBundleEnum.Whastapp &&
          (
            <>
              <div className="mt-4">
                <WhatsAppMessageEditor
                  value={message}
                  onChange={setMessage}
                />
              </div>
              {
                estado === WsBatchStatus.EnProceso && (
                  <>
                    <div className="mt-4">
                      <ProgressBar progress={progress || undefined} />
                    </div>
                  </>
                )
              }
              <div className="mt-6">
                <h4 className="mb-2 font-medium text-gray-800 dark:text-white/80">Logs en tiempo real</h4>
                <div className="max-h-64 overflow-y-auto rounded border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  {logs.length === 0 ? (
                    <p className="text-gray-400 italic">No hay logs aún...</p>
                  ) : (
                    logs.map((log, index) => (
                      <p key={index} className="mb-1">{log}</p>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                  onClick={() => handleResend(ResendOption.Todos)}
                >
                  Enviar todos
                </Button>

                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handleResend(ResendOption.Fallidos)}
                >
                  Enviar fallidos
                </Button>

                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => handleResend(ResendOption.Pendientes)}
                >
                  Enviar pendientes
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => handleResend(ResendOption.FallidosPendientes)}
                >
                  Enviar fallidos y pendientes
                </Button>
              </div>
              <div className="mt-6">
                <BundleDetailTable detail={detail} handleSendOneCell={handleSendOneCell} />
              </div>
            </>
          )
        }
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => navigate("/bundles")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Actualizar Lote
          </button>
        </div>
      </div>
    </div>

  );
};
