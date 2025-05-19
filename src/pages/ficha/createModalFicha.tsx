import { useState } from "react";
import dayjs from "dayjs";
import TextArea from "../../components/form/input/TextArea";
import { Modal } from "../../components/ui/modal";
import { FichaTecnicaEnum, TaskPrioridad, TaskStatus, TypeClientEnum, useCreateClientMutation, useCreateFichaTecnicaMutation, useCreateTaskMutation } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { ToastyErrorGraph } from "../../lib/utils";
import { z } from "zod";
import Swal from "sweetalert2";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import { DepartmentAndMunicipality } from "../../composables/DepartmentAndMunicipality";
import { TIPOS_VERTICALES } from "../../lib/vertical";
import { Trash2Icon } from "lucide-react";
import FileInput from "../../components/form/input/FileInput";
import handleUploadImage from "../../lib/uptloadFile";
const clientSchema = z.object({
  referencia: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

interface CreateTaskModalProps {
  closeModal: () => void;
  openModal: () => void;
  isOpen: boolean;
}

export const CreateBasicModal: React.FC<CreateTaskModalProps> = ({ isOpen, closeModal, openModal }) => {
  const [create] = useCreateFichaTecnicaMutation();
  
  // Estados del formulario
  const [referencia, setReferencia] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<React.ChangeEvent<HTMLInputElement>>();
  const [inputKey, setInputKey] = useState(Date.now()); // Forzar reinicio
  const onDeleteFile = () => {
    setFile(undefined);
    setInputKey(Date.now());
  };

  const handleCreateClient = async () => {
    const validationResult = clientSchema.safeParse({
      referencia,
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
        text: "¿Deseas crear esta ficha?",
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
        let fileId: null | string = null
        if(file){
          if(file?.target?.files?.[0]){
            const dataFile = await handleUploadImage(file?.target?.files?.[0])
            fileId = dataFile?.id || ''
          }else {
            toast.error('No se selecionaste un archivo para subir')
            return
          }
        }else {
          toast.error('No se selecionaste un archivo para subir')
          return
        }     
        const res = await create({
          variables: {
            createInput: {
              referencia,
              description,
              status: FichaTecnicaEnum.Active,
              fileId
            }
          }
        });
        
        if (res.errors) {
          toast.error('Hubo un error: ' + res.errors[0]);
          return;
        }
        
        apolloClient.cache.evict({ fieldName: "fichaTecnicas" });
        toast.success('Ficha tecnica creada con éxito');
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
        <div>
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            {'Crear Ficha Técnica'}
          </h5>
        </div>
        
        <div className="mt-8">
          {/* Campo: Nombre del cliente */}
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Referencia
            </label>
            <div className="relative">
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          
          {/* Campo: Descripción del cliente */}
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Descripción de la ficha tecnica
            </label>
            <TextArea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e)}
              className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-base text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </div>
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
            {"Crear Ficha"}
          </button>
        </div>
      </div>
    </Modal>
  );
};