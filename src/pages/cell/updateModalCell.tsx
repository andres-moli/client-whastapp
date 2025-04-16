import { useState, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

import { Modal } from "../../components/ui/modal";
import { ToastyErrorGraph } from "../../lib/utils";
import { useUpdateCellMutation, CellStatusEmun, WsCell } from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";

const statusOptions: Option[] = [
  { value: CellStatusEmun.Activo, label: "Activo" },
  { value: CellStatusEmun.Inactivo, label: "Inactivo" }
];

const cellSchema = z.object({
  celular: z.string().min(1, "El celular es obligatorio"),
  region: z.string().min(1, "La región es obligatoria"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  email: z.string().email("Correo inválido").optional(),
  status: z.nativeEnum(CellStatusEmun)
});

interface UpdateCellModalProps {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
  cell: WsCell | undefined
}

export const UpdateCellModal: React.FC<UpdateCellModalProps> = ({ isOpen, closeModal, openModal, cell }) => {
  if(cell == undefined) return null;
  const [updateCell] = useUpdateCellMutation();

  // Prellenar los estados
  const [celular, setCelular] = useState(cell.celular);
  const [region, setRegion] = useState(cell.region);
  const [nit, setNit] = useState(cell.nit);
  const [nombre, setNombre] = useState(cell.nombre ?? "");
  const [direccion, setDireccion] = useState(cell.direccion ?? "");
  const [email, setEmail] = useState(cell.email ?? "");
  const [status, setStatus] = useState<CellStatusEmun>(cell.status);

  useEffect(() => {
    if (isOpen) {
      setCelular(cell.celular);
      setRegion(cell.region);
      setNit(cell.nit);
      setNombre(cell.nombre ?? "");
      setDireccion(cell.direccion ?? "");
      setEmail(cell.email ?? "");
      setStatus(cell.status);
    }
  }, [isOpen, cell]);

  const handleUpdate = async () => {
    const validation = cellSchema.safeParse({
      celular,
      region,
      nit,
      nombre,
      direccion,
      email,
      status
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      closeModal();
      const confirm = await Swal.fire({
        title: "¿Actualizar celular?",
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
              id: cell.id,
              celular,
              region,
              nit,
              nombre,
              direccion,
              email,
              status
            }
          }
        });

        if (res.errors) {
          toast.error("Error al actualizar: " + res.errors[0].message);
          return;
        }

        apolloClient.cache.evict({ fieldName: "Cells" });
        toast.success("Celular actualizado correctamente");
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-3xl p-6 lg:p-10">
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">Actualizar Celular</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Celular
            </label>
            <div className="relative">
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Region
            </label>
            <div className="relative">
              <input
                type="text"
                name="reggg"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nit
            </label>
            <div className="relative">
              <input
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Dirección
            </label>
            <div className="relative">
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Correo electrónico
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <SearchableSelect
              options={statusOptions}
              placeholder="Selecciona el estado"
              onChange={(value) => setStatus(value as CellStatusEmun)}
              defaultValue={status}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
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
            {"Actualizar Celular"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
