import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { ToastyErrorGraph } from "../../lib/utils";
import { useUpdateBundleMutation, useBundleQuery, WsBatchDetail, WsBatchStatus, FileInfo } from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import TextArea from "../../components/form/input/TextArea";
import { WhatsAppMessageEditor } from "../../components/form/WhatsAppMessageEditor";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { BundleDetailTable } from "./BundleDetailTable";
import { FileIcon } from "lucide-react";

export const UpdateBundlePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [update] = useUpdateBundleMutation();
  const { data, loading } = useBundleQuery({ variables: { bundleId: id || "" }, skip: !id });

  const bundle = data?.bundle;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [nameGroup, setNameGroup] = useState("");
  const [file, setFile] = useState<FileInfo>();
  const [estado, setEstado] = useState<WsBatchStatus>();
  const [detail, setDetail] = useState<WsBatchDetail[]>([]);

  useEffect(() => {
    if (bundle) {
      setName(bundle.nombre);
      setDescription(bundle?.descripcion || '');
      setMessage(bundle.message || '');
      setNameGroup(bundle.group.nombre || '');
      setEstado(bundle.estado);
      setFile(bundle.file || undefined);
      //@ts-ignore
      setDetail(bundle.detalles || []);
    }
  }, [bundle]);

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

      const res = await update({
        variables: {
          updateInput: {
            id: bundle?.id!,
            nombre: name,
            descripcion: description,
            message: message
          }
        }
      });

      if (res.errors) {
        toast.error("Error al actualizar: " + res.errors[0].message);
        return;
      }

      apolloClient.cache.evict({ fieldName: "bundles" });
      toast.success("Lote actualizado correctamente");
      navigate("/bundles"); // O redirige a donde desees
    } catch (err) {
      ToastyErrorGraph(err as any);
    }
  };

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
        <div className="mt-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            <FileIcon /> {file.fileName}
          </a>
        </div>
      )}
      <div className="mt-4">
        <WhatsAppMessageEditor 
          value={message}
          onChange={setMessage}
        />
      </div>
      <BundleDetailTable  detail={detail} />
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
