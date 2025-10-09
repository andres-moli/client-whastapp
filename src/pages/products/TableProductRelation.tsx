import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import {
  OrderTypes,
  Product,
  useProductFeaturedsQuery,
  useRemoveProductFeaturedMutation,
  useRemoveRelatedProductMutation,
} from "../../domain/graphql";
import { formatCurrency, ToastyErrorGraph } from "../../lib/utils";
import { toast } from "sonner";
import { useModal } from "../../hooks/useModal";
import { TableBase } from "../../components/tables/BasicTables/TableBase";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";
import { CreateProductRelationModal } from "./CreateProductRelationModal";

export default function TableProductRelation({ id, products, refetch } : {id:string; products: Product[]; refetch: () => void;}) {


  const [removeFeatured] = useRemoveRelatedProductMutation();

  const {closeModal, isOpen, openModal} = useModal()



  // 🗑️ Eliminar destacado
  const onRemoveFeatured = async (productId: string) => {
    const fire = await Swal.fire({
      title: "Eliminar esta relación",
      text: "¿Estás seguro?",
      icon: "warning",
      showCancelButton: true,
    })
    if (fire.isConfirmed) {
      try {
        const res = await removeFeatured({
          variables: {
            productId: id,
            relatedProductId: productId
          }
        });
        if (res.data?.removeRelatedProduct) {
          toast.success("Destacado eliminado correctamente");
        } else {
          toast.error("Error al eliminar el destacado");
        }
      } catch (error) {
        ToastyErrorGraph(error as any);
      }
    }
  };
  const columns = [
    { key: "title", label: "Titulo" },
    { key: "reference", label: "Referencia" },
    { key: "isDiscount", label: "¿Tiene descuento?", render: (item) => item.isDiscount ? 'SI' : 'NO' },
    { key: "basePrice", label: "Precio", render: (item) => formatCurrency(item?.basePrice ?? 0) },
    {
      key: "active",
      label: "Estado",
      render: (item) => (
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${
            item.active
              ? "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30"
              : "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30"
          }`}
        >
          {item.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "center",
      render: (item) => (
        <div className="flex justify-center gap-3">
          <Trash2
            className="cursor-pointer w-5 h-5 text-rose-600 hover:scale-110 transition-transform dark:text-rose-400"
            onClick={() => onRemoveFeatured(item.id)}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end items-center p-4">
        <ButtonTable onClick={() => openModal()}>
          Crear relación
        </ButtonTable>
      </div>
      {/* 🧾 Tabla principal */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1100px]">
        <TableBase
        // @ts-ignore
            columns={columns}
            data={products || []}
            emptyMessage="No hay productos relacionados aún"
          />
          <CreateProductRelationModal
            closeModal={closeModal}
            isOpen={isOpen}
            productId={id}
            refetch={refetch}
          />
        </div>
      </div>
    </div>
  );
}
