import { useState, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

import { ToastyErrorGraph } from "../../lib/utils";
import {
  useUpdateClassMutation,
  ClassStatus,
  useClassQuery,
} from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import TextArea from "../../components/form/input/TextArea";
import SubClassTable from "./tableSubClass";
import { useNavigate, useParams } from "react-router";
import { CreateSubClassModal } from "./CreateSubClassModal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";

const statusOptions: Option[] = [
  { value: ClassStatus.Active, label: "Activo" },
  { value: ClassStatus.Inactive, label: "Inactivo" },
  { value: ClassStatus.Archived, label: "Archivado" },
];

const cellSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

export default function EditClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {isOpen, closeModal, openModal} = useModal()
  const { data, loading, error, refetch } = useClassQuery({ variables: { 
    classId: id!
   } });
  const [updateClass] = useUpdateClassMutation();

  const cllass = data?.Class;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ClassStatus>(ClassStatus.Active);

  useEffect(() => {
    if (cllass) {
      setName(cllass.name);
      setDescription(cllass.description || "");
      setStatus(cllass.status);
    }
  }, [cllass]);

  const handleUpdate = async () => {
    const validation = cellSchema.safeParse({ name, description });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: "¿Actualizar Clase?",
        text: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      const res = await updateClass({
        variables: {
          updateInput: {
            id: id!,
            name,
            description,
            status,
          },
        },
      });

      if (res.errors) {
        toast.error("Error al actualizar: " + res.errors[0].message);
        return;
      }

      apolloClient.cache.evict({ fieldName: "Classes" });
      toast.success("Clase actualizada correctamente");
      navigate("/class"); // opcional: redirigir
    } catch (err) {
      ToastyErrorGraph(err as any);
    }
  };

  if (loading) return <div className="p-4">Cargando clase...</div>;
  if (error || !cllass) return <div className="p-4 text-red-500">Error al cargar la clase.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageMeta
        title={`${name || 'Cargando...'}`}
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Editar Clase</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
          <TextArea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e)}
            className="w-full rounded border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
          <SearchableSelect
            options={statusOptions}
            placeholder="Selecciona el estado"
            onChange={(value) => setStatus(value as ClassStatus)}
            defaultValue={status}
          />
        </div>

        <div className="mt-4">
          <SubClassTable subClass={cllass.subclasses || []} key={cllass.id} cllasId={cllass.id} refetch={refetch}/>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            className="rounded bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
          >
            Actualizar Clase
          </button>
        </div>
      </div>

    </div>
  );
}
