import { useState } from "react";
import dayjs from "dayjs";
import TextArea from "../../components/form/input/TextArea";
import { Modal } from "../../components/ui/modal";
import {
  TypeBundleEnum,
  useCreateBundleMutation,
  useGroupsQuery,
} from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { ToastyErrorGraph } from "../../lib/utils";
import { z } from "zod";
import Swal from "sweetalert2";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import { WhatsAppMessageEditor } from "../../components/form/WhatsAppMessageEditor";
import { Trash2Icon } from "lucide-react";
import FileInput from "../../components/form/input/FileInput";
import handleUploadImage from "../../lib/uptloadFile";

const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

interface CreateTaskModalProps {
  closeModal: () => void;
  openModal: () => void;
  isOpen: boolean;
}

export const CreateBundleModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  closeModal,
  openModal,
}) => {
  const { user } = useUser();
  const [createTask] = useCreateBundleMutation();
  const { data } = useGroupsQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 99999999,
      },
    },
    fetchPolicy: "no-cache",
  });

  const optionGroup: Option[] =
    data?.groups?.map((group) => ({
      value: group.id,
      label:
        group.nombre +
        " - " +
        group.descripcion +
        " - " +
        group.wsGroupCells?.length,
    })) || [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [selectId, setSelectIdGroup] = useState<string>();
  const [tipoLote, setTipoLote] = useState<TypeBundleEnum>(TypeBundleEnum.Whastapp);

  const [file, setFile] = useState<React.ChangeEvent<HTMLInputElement>>();
  const [htmlFile, setHtmlFile] = useState<React.ChangeEvent<HTMLInputElement>>();

  const [inputKey, setInputKey] = useState(Date.now());
  const [htmlInputKey, setHtmlInputKey] = useState(Date.now());

  const handleCreateClient = async () => {
    const validationResult = clientSchema.safeParse({
      name,
      description,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      closeModal();
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas crear este lote?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear",
        cancelButtonText: "Cancelar",
      });

      if (result.dismiss) {
        openModal();
        return;
      }

      if (result.isConfirmed) {
        const groupSelected = data?.groups?.find(
          (group) => group.id === selectId
        );
        if (!groupSelected) {
          toast.error("Grupo no encontrado");
          return;
        }

        let fileId: null | string = null;
        let htmlFileId: null | string = null;

        if (file?.target?.files?.[0]) {
          const dataFile = await handleUploadImage(file.target.files[0]);
          fileId = dataFile?.id || "";
        }

        if (tipoLote === TypeBundleEnum.Emails) {
          if (!htmlFile?.target?.files?.[0]) {
            toast.error("Debes seleccionar un archivo HTML");
            return;
          }

          const htmlFileName = htmlFile.target.files[0].name;
          if (!htmlFileName.endsWith(".html")) {
            toast.error("El archivo HTML debe tener extensión .html");
            return;
          }
          const uploadedHtml = await handleUploadImage(
            htmlFile.target.files[0]
          );
          htmlFileId = uploadedHtml?.id || "";
        }

        const res = await createTask({
          variables: {
            createInput: {
              nombre: name,
              descripcion: description,
              groupId: groupSelected.id,
              message: tipoLote === TypeBundleEnum.Whastapp ? message : '',
              createdByUserAtId: user?.id,
              celularesIds:
                groupSelected.wsGroupCells?.map((group) => group.cell.id) ||
                [],
              type: tipoLote,
              fileId: fileId || undefined,
              fileHtmlId: htmlFileId || undefined
            },
          },
        });

        if (res.errors) {
          toast.error("Hubo un error: " + res.errors[0]);
          return;
        }

        apolloClient.cache.evict({ fieldName: "bundles" });
        toast.success("Lote creado con éxito");
        closeModal();
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[1200px] p-6 lg:p-10"
    >
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
          Crear Lote
        </h5>

        {/* Tipo de lote */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Tipo de Lote
        </label>
        <select
          value={tipoLote}
          onChange={(e) => setTipoLote(e.target.value as TypeBundleEnum)}
          className="mb-4 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value={TypeBundleEnum.Whastapp}>WhatsApp</option>
          <option value={TypeBundleEnum.Emails}>Email</option>
        </select>

        {/* Nombre */}
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Nombre del lote
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        {/* Descripción */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Descripción del lote
        </label>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        {/* Grupo */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Grupo
        </label>
        <SearchableSelect
          options={optionGroup}
          placeholder="Selecciona un grupo"
          onChange={(value) => setSelectIdGroup(value)}
        />

        {/* Archivos para Email */}
        {tipoLote === TypeBundleEnum.Emails && (
          <>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Archivo HTML (contenido del correo)
              </label>
              {htmlFile && (
                <Trash2Icon
                  className="mb-1.5 cursor-pointer"
                  onClick={() => {
                    setHtmlFile(undefined);
                    setHtmlInputKey(Date.now());
                    toast.success("Archivo HTML eliminado");
                  }}
                />
              )}
              <FileInput
                key={htmlInputKey.toString()}
                onChange={(e) => setHtmlFile(e)}
                accept=".html"
              />
            </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Subir archivo
            </label>
            {file && (
              <Trash2Icon
                className="mb-1.5 cursor-pointer"
                onClick={() => {
                  setFile(undefined);
                  setInputKey(Date.now());
                  toast.success("Archivo eliminado");
                }}
              />
            )}
            <FileInput
              key={inputKey.toString()}
              onChange={(e) => setFile(e)}
            />
          </div>
          </>
        )}

        {/* Archivo para WhatsApp */}
        {tipoLote === TypeBundleEnum.Whastapp && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Subir archivo
            </label>
            {file && (
              <Trash2Icon
                className="mb-1.5 cursor-pointer"
                onClick={() => {
                  setFile(undefined);
                  setInputKey(Date.now());
                  toast.success("Archivo eliminado");
                }}
              />
            )}
            <FileInput
              key={inputKey.toString()}
              onChange={(e) => setFile(e)}
            />
          </div>
        )}

        {/* Editor WhatsApp */}
        {tipoLote === TypeBundleEnum.Whastapp && (
          <div className="mt-4">
            <WhatsAppMessageEditor value={message} onChange={setMessage} />
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center gap-3 mt-6 sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Cerrar
          </button>
          <button
            onClick={handleCreateClient}
            type="button"
            className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Crear Lote
          </button>
        </div>
      </div>
    </Modal>
  );
};
