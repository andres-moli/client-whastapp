import { useState, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

import { Modal } from "../../components/ui/modal";
import { ToastyErrorGraph } from "../../lib/utils";
import { useUpdateCellMutation, CellStatusEmun, Class, useUpdateClassMutation, ClassStatus } from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import TextArea from "../../components/form/input/TextArea";
import SubClassTable from "./tableSubClass";

const statusOptions: Option[] = [
  { value: ClassStatus.Active, label: "Activo" },
  { value: ClassStatus.Inactive, label: "Inactivo" },
  { value: ClassStatus.Archived, label: "Archivado" },
  
];

const cellSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

interface UpdateCellModalProps {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
  cllass: Class | undefined
}

export const UpdateClasModal: React.FC<UpdateCellModalProps> = ({ isOpen, closeModal, openModal, cllass}) => {
  if(!cllass) return null
  const [updateCell] = useUpdateClassMutation();

  // Prellenar los estados
  const [name, setName] = useState(cllass.name);
  const [description, setDescription] = useState(cllass.description);
    const [status, setStatus] = useState<ClassStatus>(cllass.status);
  
  const handleUpdate = async () => {
    const validation = cellSchema.safeParse({
      name,
      description,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      closeModal();
      const confirm = await Swal.fire({
        title: "¿Actualizar Clase?",
        text: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar"
      });

      if (confirm.dismiss) {
        openModal();
        return;
      }

      if (confirm.isConfirmed) {
        const res = await updateCell({
          variables: {
            updateInput: {
              id: cllass.id,
              description: description,
              name: name,
              status
            }
          }
        });

        if (res.errors) {
          toast.error("Error al actualizar: " + res.errors[0].message);
          return;
        }

        apolloClient.cache.evict({ fieldName: "Classes" });
        toast.success("Clase actualizada correctamente");
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    }
  };

  return (
  <Modal isOpen={isOpen} onClose={closeModal} className="max-w-16xl p-6 lg:p-10">
    <div className="flex flex-col h-[90vh]"> {/* Altura máxima del modal */}
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">Actualizar Clases</h5>

        <div>
          {/* Campo: Nombre del cliente */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          
          {/* Campo: Descripción del cliente */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Descripción de la clase
            </label>
            <TextArea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e)}
              className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-base text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <SearchableSelect
              options={statusOptions}
              placeholder="Selecciona el estado"
              onChange={(value) => setStatus(value as ClassStatus)}
              defaultValue={status}
            />
          </div>
          <div className="mt-2">
            {/* @ts-ignore */}
            <SubClassTable subClass={cllass.subclasses || []} key={cllass.id}/>
          </div>
        </div>
        {/* Botones del modal */}
        <div className="flex items-center gap-3 mt-2 modal-footer sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Cerrar
          </button>
          <button
            onClick={handleUpdate}
            type="button"
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {"Actualizar Clase"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
