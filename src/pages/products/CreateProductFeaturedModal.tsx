import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { z } from "zod";
import { Modal } from "../../components/ui/modal";
import { ToastyErrorGraph } from "../../lib/utils";
import {
  useCreateProductFeaturedMutation,
  useProductsQuery,
  ProductFeaturedType,
} from "../../domain/graphql";
import { InputFecha } from "../../components/form/input/InputFecha";

const featuredSchema = z.object({
  type: z.string(),
  discountPercentage: z
    .number()
    .min(0, "Debe ser mayor o igual a 0")
    .max(100, "No puede ser mayor a 100")
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

interface CreateProductFeaturedModalProps {
  isOpen: boolean;
  producId: string;
  closeModal: () => void;
  openModal: () => void;
  refetch: () => void;
}

export const CreateProductFeaturedModal: React.FC<
  CreateProductFeaturedModalProps
> = ({ isOpen, closeModal, openModal, refetch, producId }) => {
  const [createProductFeatured] = useCreateProductFeaturedMutation();

  // Campos de formulario
  const [type, setType] = useState<ProductFeaturedType>(ProductFeaturedType.Nuevo);
  const [discountPercentage, setDiscountPercentage] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreateFeatured = async () => {
    const validation = featuredSchema.safeParse({
      type,
      discountPercentage,
      startDate,
      endDate,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      closeModal();
      const result = await Swal.fire({
        title: "¿Crear destacado?",
        text: "¿Deseas crear este destacado o promoción?",
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
        const res = await createProductFeatured({
          variables: {
            createInput: {
              productId: producId,
              active: true,
              type,
              discountPercentage,
              startDate: startDate ? new Date(startDate) : undefined,
              endDate: endDate ? new Date(endDate) : undefined,
            },
          },
        });

        if (res.errors) {
          toast.error("Error al crear el destacado: " + res.errors[0].message);
          return;
        }

        refetch();
        toast.success("Destacado creado exitosamente");
        setType(ProductFeaturedType.Nuevo);
        setDiscountPercentage(undefined);
        setStartDate("");
        setEndDate("");
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
          Crear destacado / promoción
        </h5>

        {/* Tipo */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Tipo de destacado
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProductFeaturedType)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Seleccionar tipo</option>
            <option value={ProductFeaturedType.Principal}>Destacado Principal</option>
            <option value={ProductFeaturedType.TopVentas}>Top Ventas</option>
            <option value={ProductFeaturedType.Nuevo}>Nuevo Producto</option>
            <option value={ProductFeaturedType.Oferta}>Oferta</option>
          </select>
        </div>

        {/* Descuento (solo para OFERTA) */}
        {type === "OFERTA" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Porcentaje de descuento (%)
            </label>
            <input
              type="number"
              value={discountPercentage ?? ""}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              min={0}
              max={100}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputFecha
            label="Fecha de inicio"
            value={startDate}
            onChange={(value) => setStartDate(value)}
          />

          <InputFecha
            label="Fecha de fin"
            value={endDate}
            onChange={(value) => setEndDate(value)}
            minDate={startDate ? new Date(startDate) : undefined}
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Cerrar
          </button>
          <button
            onClick={handleCreateFeatured}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm text-white hover:bg-brand-600"
          >
            Crear Destacado
          </button>
        </div>
      </div>
    </Modal>
  );
};
