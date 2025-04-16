import { useState, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

import { ToastyErrorGraph } from "../../lib/utils";
import { useUpdateGroupMutation, WsGroup, WsCell, useGroupQuery, useRemoveGroupWithCellsMutation } from "../../domain/graphql";
import TextArea from "../../components/form/input/TextArea";
import { CellSampleTable } from "../cell/CellSampleTable";
import { useNavigate, useParams } from "react-router";
import { Loader } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const cellSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

export const UpdateGroupPage: React.FC = () => {
  const { id } = useParams(); // Asegúrate de tener el param en la ruta
  const navigate = useNavigate();

  const { data, loading, refetch } = useGroupQuery({
    variables: { 
      groupId: id! 
    },
    skip: !id,
  });
  const [deleteGroupCell] = useRemoveGroupWithCellsMutation();
  const [updateGroup] = useUpdateGroupMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cells, setCells] = useState<WsCell[]>([]);

  const group = data?.group as WsGroup;

  useEffect(() => {
    if (group) {
      setName(group.nombre || "");
      setDescription(group.descripcion || "");
      setCells(group.wsGroupCells?.map((value) => value.cell) || []);
    }
  }, [group]);

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
      const confirm = await Swal.fire({
        title: "¿Actualizar grupo?",
        text: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      const res = await updateGroup({
        variables: {
          updateInput: {
            id: group.id,
            nombre: name,
            descripcion: description,
          },
        },
      });

      if (res.errors) {
        toast.error("Error al actualizar: " + res.errors[0].message);
        return;
      }

      toast.success("Grupo actualizado correctamente");
      navigate("/grupos"); // Redirige a la lista de grupos, ajusta según tu ruta
    } catch (err) {
      ToastyErrorGraph(err as any);
    }
  };

  if (loading || !group) return <Loader />;
  const onDelete = async (id: string) => {
    try {
      const confirm = await Swal.fire({
        title: "Eliminar del grupo?",
        text: "¿Deseas Eliminar este numero del grupo?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
      });
      if(confirm.isConfirmed){
        const res = await deleteGroupCell({
          variables: {
            groupId: group.id,
            cellId: id,
          },
        });
        if (res.errors) {
          toast.error("Error al eliminar: " + res.errors[0].message);
          return;
        }
        refetch()
        toast.success("Grupo actualizado correctamente");

      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div>
    <PageMeta
      title={loading ? 'cargando...' : `Actualizar lote ${group.nombre}`}
      description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
    />
    <PageBreadcrumb pageTitle="Grupo detalle " />
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
    <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
      Detalle del grupo
    </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre del grupo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Descripción del grupo</label>
          <TextArea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Celulares asociadas</label>
          <CellSampleTable cells={cells} onDelete={(id) => onDelete(id)} />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Actualizar Grupo
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};
