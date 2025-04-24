import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Modal } from "../../components/ui/modal";
import { ToastyErrorGraph } from "../../lib/utils";
import { useCreateCellMutation, CellStatusEmun, useCitiesQuery, useUsersQuery, TypeClientEnum, useGroupsQuery, useAddCellToGroupMutation, useCellsQuery, OrderTypes, WsCell } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { apolloClient } from "../../main.config";

interface CreateCellModalProps {
  closeModal: () => void;
  openModal: () => void;
  isOpen: boolean;
  grupoId: string;
}
export const AddCellToGroupModal: React.FC<CreateCellModalProps> = ({
  isOpen,
  closeModal,
  openModal,
  grupoId,
}) => {
  const { user } = useUser();
  const [createCell] = useAddCellToGroupMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [celular, setCelular] = useState<string>("");

  const { data, loading, refetch } = useCellsQuery({
    variables: {
      where: searchTerm
        ? {
            _or: [
              { celular: { _contains: searchTerm } },
              { nombre: { _contains: searchTerm } },
              { email: { _contains: searchTerm } },
              { nit: { _contains: searchTerm } },
              { direccion: { _contains: searchTerm } },
            ],
          }
        : {},
      orderBy: { createdAt: OrderTypes.Desc },
      pagination: { skip: 0, take: 20 },
    },
    fetchPolicy: "no-cache",
  });

  const handleSelect = (id: string) => {
    setCelular(id);
  };
  useEffect(() => {
    if(celular){
      const cell = data?.Cells.find((cell) => cell.id === celular) as WsCell;
      if (cell) {
        handleCreate(cell);
      } 
    }
  },[celular])

  const handleCreate = async (cell: WsCell) => {
    try {
      closeModal();
      const confirm = await Swal.fire({
        title: `¿Agregar celular al grupo a ${cell?.celular}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, agregar",
        cancelButtonText: "Cancelar",
      });

      if (confirm.dismiss) {
        openModal();
        return;
      }

      if (confirm.isConfirmed) {
        const res = await createCell({
          variables: {
            groupId: grupoId,
            cellId: celular,
          },
        });

        if (res.errors) {
          toast.error("Error: " + res.errors[0].message);
          return;
        }

        apolloClient.cache.evict({ fieldName: "group" });
        toast.success("Celular agregado exitosamente");
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-3xl p-6 lg:p-10">
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">
          Agregar celular al grupo
        </h5>

        <div className="mt-6 relative">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Buscar celular o nombre...
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            placeholder="Escribe para buscar..."
          />
          {searchTerm && (data?.Cells.length || 0) > 0 && (
          <ul className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
              {(data?.Cells.length || 0)> 0 ? (
                data?.Cells.map((cell) => (
                  <li
                    key={cell.id}
                    onClick={() => handleSelect(cell.id)}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      celular === cell.id ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""
                    }`}
                  >
                    <span className="text-gray-800 dark:text-white">
                      {cell.nombre} - {cell.celular}
                    </span>
                    {celular === cell.id && (
                      <span className="text-green-500 dark:text-green-400">✔</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500 dark:text-white/40">
                  Sin resultados
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
