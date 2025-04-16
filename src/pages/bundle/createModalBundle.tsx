import { useState } from "react";
import dayjs from "dayjs";
import TextArea from "../../components/form/input/TextArea";
import { Modal } from "../../components/ui/modal";
import { TaskPrioridad, TaskStatus, TypeClientEnum, useCreateBundleMutation, useCreateClientMutation, useCreateTaskMutation, useGroupsQuery, WsGroup } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { ToastyErrorGraph } from "../../lib/utils";
import { z } from "zod";
import Swal from "sweetalert2";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import { DepartmentAndMunicipality } from "../../composables/DepartmentAndMunicipality";
import { TIPOS_VERTICALES } from "../../lib/vertical";
import { WhatsAppMessageEditor } from "../../components/form/WhatsAppMessageEditor";
import { Trash2Icon } from "lucide-react";
import FileInput from "../../components/form/input/FileInput";
import handleUploadImage from "../../lib/uptloadFile";
const regexNit = /^\d{9}-\d$/
const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

interface CreateTaskModalProps {
  closeModal: () => void;
  openModal: () => void;
  isOpen: boolean;
}

export const CreateBundleModal: React.FC<CreateTaskModalProps> = ({ isOpen, closeModal, openModal }) => {
  const { user } = useUser();
  const [createTask] = useCreateBundleMutation();
  const {data, loading} = useGroupsQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 99999999
      }
    }
  })
  const optionGroup: Option[] = data?.groups?.map((group) => ({
    value: group.id,
    label: group.nombre + ' - ' + group.descripcion + ' - ' + group.wsGroupCells?.length,
  })) || [];
  // Estados del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [selectId, setSelectIdGroup] = useState<string>();
  const [file, setFile] = useState<React.ChangeEvent<HTMLInputElement>>();
  const [inputKey, setInputKey] = useState(Date.now()); // Forzar reinicio
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
        const groupSelected = data?.groups?.find((group) => group.id === selectId);
        if (!groupSelected) {
          toast.error("Grupo no encontrado");
          return;
        }    
        let fileId: null | string = null
        if(file){
          if(file?.target?.files?.[0]){
            const dataFile = await handleUploadImage(file?.target?.files?.[0])
            fileId = dataFile?.id || ''
          }else {
            toast.error('No se selecionaste un archivo para subir')
            return
          }
        }
        const res = await createTask({
          variables: {
            createInput: {
              nombre: name,
              descripcion: description,
              groupId: groupSelected.id,
              message: message,
              createdByUserAtId: user?.id,
              celularesIds: groupSelected.wsGroupCells?.map((group) => group.cell.id) || [],
              fileId: fileId ? fileId : undefined
            }
          }
        });
        
        if (res.errors) {
          toast.error('Hubo un error: ' + res.errors[0]);
          return;
        }
        
        apolloClient.cache.evict({ fieldName: "bundles" });
        toast.success('Lote creado con éxito');
        closeModal();
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    }
  };
  const onDeleteFile = () => {
    setFile(undefined)
    setInputKey(Date.now()); // Cambia la key para reiniciar el input
    toast.success('Archivo eliminado con exitó')
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[1200px] p-6 lg:p-10"
    >
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <div>
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            {'Crear Lote'}
          </h5>
        </div>
          {/* Campo: Nombre del cliente */}
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Nombre del lote
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Descripción del lote
          </label>
          <TextArea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e)}
            className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-base text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grupo</label>
          <SearchableSelect
            options={optionGroup}
            placeholder="Selecciona un grupo"
            onChange={(value) => setSelectIdGroup(value)}
          />
        {/* Subir archivo */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Subir archivo
          </label>
          {file && (
            <Trash2Icon className="mb-1.5 block cursor-pointer" onClick={onDeleteFile} />
          )}
          <FileInput
             key={inputKey.toString()} // Cambia la key para forzar el reinicio
            onChange={(e) => setFile(e)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
          <div className="mt-4">
            <WhatsAppMessageEditor 
              value={message}
              onChange={setMessage}
            />
          </div>

        {/* Botones del modal */}
        <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
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
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {"Crear Lote"}
          </button>
        </div>
      </div>
    </Modal>
  );
};