import { useState } from "react";
import { z } from "zod";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useUser } from "../../context/UserContext";
import TextArea from "../../components/form/input/TextArea";
import { ToastyErrorGraph } from "../../lib/utils";
import { apolloClient } from "../../main.config";
import { CellSelectorTable } from "../cell/CellSelectorTable";
import { useCreateGroupMutation } from "../../domain/graphql";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { CreateCellModal } from "../cell/createModalCellc";
import { useModal } from "../../hooks/useModal";
import { ButtonTable } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";

const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

export const CreateGroupPage = () => {
  const { user } = useUser();
  const [create] = useCreateGroupMutation();
  const { isOpen, openModal, closeModal } = useModal();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectIds, setSelectedIds] = useState<string[]>([]);

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
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas crear este grupo?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const res = await create({
          variables: {
            createInput: {
              nombre: name,
              descripcion: description,
              cellIds: selectIds,
            },
          },
        });

        if (res.errors) {
          toast.error("Hubo un error: " + res.errors[0]);
          return;
        }

        apolloClient.cache.evict({ fieldName: "groups" });
        toast.success("Grupo creado con éxito");
        // puedes redirigir o limpiar el formulario aquí
        setName("");
        setDescription("");
        setSelectedIds([]);
      }
    } catch (err) {
      ToastyErrorGraph(err as any);
    }
  };

  const handleSelectedIds = (ids: string[]) => {
    setSelectedIds(ids);
    console.log("IDs seleccionados:", ids);
  };

  return (
      <div>
      <PageMeta
        title={"Crear grupo"}
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Crear grupo " />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
        Crear grupo
      </h3>
      {/* Campo: Nombre */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
          Nombre del grupo
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      {/* Campo: Descripción */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
          Descripción del grupo
        </label>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e)}
          className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-base text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
      <Button onClick={openModal}>
        Crear Celular
      </Button>
      {/* Selector de Celdas */}
      <div className="mb-7">
        <CellSelectorTable onSelectionChange={handleSelectedIds} />
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setName("");
            setDescription("");
            setSelectedIds([]);
          }}
          className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Limpiar
        </button>
        <button
          onClick={handleCreateClient}
          className="btn btn-success flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Crear Grupo
        </button>
      </div>
    </div>
    <CreateCellModal 
      closeModal={closeModal}
      isOpen={isOpen} 
      openModal={openModal}
    />
    </div>

  );
};
