import { useState } from "react";
import dayjs from "dayjs";
import TextArea from "../../components/form/input/TextArea";
import { Modal } from "../../components/ui/modal";
import { TaskPrioridad, TaskStatus, TypeClientEnum, useCreateClientMutation, useCreateTaskMutation, useImportGroupWithExcellMutation } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { ToastyErrorGraph } from "../../lib/utils";
import { z } from "zod";
import Swal from "sweetalert2";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import { DepartmentAndMunicipality } from "../../composables/DepartmentAndMunicipality";
import { TIPOS_VERTICALES } from "../../lib/vertical";
import handleUploadImage from "../../lib/uptloadFile";
import { Trash2Icon } from "lucide-react";
import FileInput from "../../components/form/input/FileInput";


interface CreateTaskModalProps {
  closeModal: () => void;
  openModal: () => void;
  isOpen: boolean;
}


export const CreateGrupoExcelModal: React.FC<CreateTaskModalProps> = ({ isOpen, closeModal, openModal }) => {
  const { user } = useUser();
  const [create] = useImportGroupWithExcellMutation();
  const [file, setFile] = useState<React.ChangeEvent<HTMLInputElement>>();
  const [inputKey, setInputKey] = useState(Date.now()); // Forzar reinicio


  const handleCreateClient = async () => {
    let loading
    try {
      closeModal();
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas crear este grupo desde este excel?",
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
        let fileId: null | string = null;
        if(file){
          if(file?.target?.files?.[0]){
            const dataFile = await handleUploadImage(file?.target?.files?.[0])
            fileId = dataFile?.id || ''
          }else {
            toast.error('No se selecionaste un archivo para subir')
            return
          }
        }    
        if(!fileId) {
          toast.error('No se selecionaste un archivo para subir') 
          return;
        } 
        loading = toast.loading('Creando grupos...');
        const res = await create({
          variables: {
            fileId: fileId
          }
        });
        
        if (res.errors) {
          toast.dismiss(loading);
          toast.error('Hubo un error: ' + res.errors[0]);
          return;
        }
        toast.dismiss(loading);
        
        apolloClient.cache.evict({ fieldName: "groups" });
        toast.success('Grupos creado con éxito');
        closeModal();
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    } finally {
      toast.dismiss(loading);
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
            {'Crear Grupos desde excel'}
          </h5>
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
            {"Crear Grupos"}
          </button>
        </div>
      </div>
    </Modal>
  );
};