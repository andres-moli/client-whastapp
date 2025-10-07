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
  useProductFeaturedsQuery,
  useRemoveProductFeaturedMutation,
} from "../../domain/graphql";
import { formatCurrency, ToastyErrorGraph } from "../../lib/utils";
import { CheckCircle2Icon, Eye, Search, Trash2 } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { toast } from "sonner";
import { CloseIcon } from "../../icons";
import { CreateProductFeaturedModal } from "./CreateProductFeaturedModal";
import { useModal } from "../../hooks/useModal";
import { TableBase } from "../../components/tables/BasicTables/TableBase";

export default function TableProductFeatured({ id } : {id: string}) {
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "yes" | "no">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [removeFeatured] = useRemoveProductFeaturedMutation();

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  const {closeModal, isOpen, openModal} = useModal()
  // 📘 Filtros dinámicos
  const whereFilter = useMemo(() => {
    const filters: any[] = [];
    if (statusFilter === "yes") {
      filters.push({ active: { _eq: true } });
    } else if (statusFilter === "no") {
      filters.push({ active: { _eq: false } });
    }

    if (typeFilter !== "all") {
      filters.push({ type: { _eq: typeFilter } });
    }

    return filters.length > 0 ? { _and: filters } : undefined;
  }, [searchTerm, statusFilter, typeFilter]);

  // 📗 Query principal
  const { data, loading, refetch } = useProductFeaturedsQuery({
    variables: {
      where: {
        ...whereFilter,
        product: {
          _eq: id
        }
      },
      orderBy: { createdAt: OrderTypes.Desc },
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      },
    },
  });

  // 🔍 Debounce para evitar spam de queries
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
      }, 500),
    []
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);


  // 🗑️ Eliminar destacado
  const onRemoveFeatured = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este destacado?")) {
      try {
        const res = await removeFeatured({
          variables: { removeProductFeaturedId: id },
        });
        if (res.data?.removeProductFeatured) {
          toast.success("Destacado eliminado correctamente");
          refetch();
        } else {
          toast.error("Error al eliminar el destacado");
        }
      } catch (error) {
        ToastyErrorGraph(error as any);
      }
    }
  };
  if(loading){
    return (
      <div className="flex justify-between items-center p-4">
        Cargando...
      </div>
    )
  }
  const columns = [
    { key: "type", label: "Tipo" },
    { key: "startDate", label: "Fecha Inicio", render:(item) => item.startDate ? new Date(item.startDate).toLocaleDateString() : '-' },
    { key: "endDate", label: "Fecha Fin", render:(item) => item.endDate ?  new Date(item.endDate).toLocaleDateString() : '-' },
    { key: "basePrice", label: "Precio", render: (item) => formatCurrency(item?.basePrice ?? 0) },
    { key: "discountPercentage", label: "Descuento", render: (item) => (item?.discountPercentage ?? 0) },
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
      {/* 🔍 Filtros superiores */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2 w-full max-w-lg">
          <select
            className="text-sm border rounded-md px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
            onChange={(e) => setTypeFilter(e.target.value)}
            value={typeFilter}
          >
            <option value="all">Todos los tipos</option>
            <option value="DESTACADO_PRINCIPAL">Destacado Principal</option>
            <option value="TOP_VENTAS">Top Ventas</option>
            <option value="NUEVO_PRODUCTO">Nuevo Producto</option>
            <option value="OFERTA">Oferta</option>
          </select>

          <select
            className="text-sm border rounded-md px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
            onChange={(e) => setStatusFilter(e.target.value as "all" | "yes" | "no")}
            value={statusFilter}
          >
            <option value="all">Todos</option>
            <option value="yes">Activo</option>
            <option value="no">Inactivo</option>
          </select>
        </div>

        <ButtonTable onClick={() => openModal()}>
          Crear destacado
        </ButtonTable>
      </div>

      {/* 🧾 Tabla principal */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1100px]">
        <TableBase
        // @ts-ignore
            columns={columns}
            data={data?.productFeatureds || []}
            loading={loading}
            emptyMessage="No hay productos destacados aún 🌟"
          />
          {/* 📄 Paginación */}
          <Pagination
            totalItems={data?.productFeaturedsCount.totalItems || 0}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(
              (data?.productFeaturedsCount.totalItems || 0) / itemsPerPage
            )}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
          <CreateProductFeaturedModal
            isOpen={isOpen}
            closeModal={closeModal}
            openModal={openModal}
            refetch={refetch}
            producId={id}
          />
        </div>
      </div>
    </div>
  );
}
