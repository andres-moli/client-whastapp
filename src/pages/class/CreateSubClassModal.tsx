import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { z } from "zod";

import { Modal } from "../../components/ui/modal";
import TextArea from "../../components/form/input/TextArea";
import { useCreateSubClassMutation } from "../../domain/graphql";
import { ToastyErrorGraph } from "../../lib/utils";
import { apolloClient } from "../../main.config";

const subClassSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

interface CreateSubClassModalProps {
  classId: string;
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
  refetch: () => void;
}

export const CreateSubClassModal: React.FC<CreateSubClassModalProps> = ({
  classId,
  isOpen,
  closeModal,
  openModal,
  refetch
}) => {
  const [createSubClass] = useCreateSubClassMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateSubClass = async () => {
    const validation = subClassSchema.safeParse({ name, description });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      closeModal();
      const result = await Swal.fire({
        title: "¿Crear SubClase?",
        text: "¿Deseas crear esta subclase?",
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
        const res = await createSubClass({
          variables: {
            createInput: {
              name,
              description,
              classId,
            },
          },
        });

        if (res.errors) {
          toast.error("Error al crear la SubClase: " + res.errors[0].message);
          return;
        }

        refetch()
        toast.success("SubClase creada exitosamente");
        setName("");
        setDescription("");
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
      className="max-w-[800px] p-6 lg:p-10"
    >
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">
          Crear SubClase
        </h5>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Descripción
          </label>
          <TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e)}
            className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-800 focus:border-brand-300 focus:ring-3 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Cerrar
          </button>
          <button
            onClick={handleCreateSubClass}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm text-white hover:bg-brand-600"
          >
            Crear SubClase
          </button>
        </div>
      </div>
    </Modal>
  );
};
