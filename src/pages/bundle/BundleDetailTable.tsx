import {
Table,
TableBody,
TableCell,
TableHeader,
TableRow,
} from "../../components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { Search, Send, Trash2 } from "lucide-react";
import Input from "../../components/form/input/InputField";
import { Pagination } from "../../components/ui/table/pagination";
import { debounce } from "lodash";
import { WsBatchDetail, WsBatchDetailStatus, WsCell } from "../../domain/graphql";
import clsx from "clsx";


type Props = {
    detail: WsBatchDetail[];
};

export const BundleDetailTable = ({ detail }: Props) => {
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState<WsBatchDetailStatus | "SIN_ESTADO" | "ALL">("ALL");

const debouncedSearch = useMemo(
    () =>
    debounce((term: string) => {
        setSearchTerm(term.toLowerCase());
        setCurrentPage(1);
    }, 300),
    []
);

useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
};

const filteredCells = useMemo(() => {
    return detail.filter((detail) => {
      const matchesSearch =
        detail.celular.celular.toLowerCase().includes(searchTerm) ||
        detail.celular.nombre?.toLowerCase().includes(searchTerm) ||
        detail.celular.email?.toLowerCase().includes(searchTerm) ||
        detail.celular?.nit?.toLowerCase().includes(searchTerm);
  
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "SIN_ESTADO"
          ? !detail.estado
          : detail.estado === statusFilter;
  
      return matchesSearch && matchesStatus;
    });
  }, [detail, searchTerm, statusFilter]);
  

const paginatedCells = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCells.slice(start, start + itemsPerPage);
}, [filteredCells, currentPage, itemsPerPage]);

const handlePageChange = (page: number) => setCurrentPage(page);
const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setCurrentPage(1);
};

return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
    <div className="flex justify-between items-center p-4">
        <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
            type="text"
            placeholder="Buscar por celular, nombre, email, NIT..."
            className="pl-10 w-full"
            onChange={handleSearchChange}
        />
        </div>
    </div>
    <div className="flex gap-2 px-4 pb-2">
  <button
    onClick={() => setStatusFilter("ALL")}
    className={clsx(
      "px-3 py-1 rounded-full border text-sm font-medium",
      statusFilter === "ALL" ? "bg-gray-800 text-white" : "border-gray-300 text-gray-600"
    )}
  >
    Todos
  </button>
  <button
    onClick={() => setStatusFilter(WsBatchDetailStatus.Enviado)}
    className={clsx(
      "px-3 py-1 rounded-full border text-sm font-medium",
      statusFilter === WsBatchDetailStatus.Enviado
        ? "bg-green-600 text-white"
        : "border-green-600 text-green-600"
    )}
  >
    Enviados
  </button>
  <button
    onClick={() => setStatusFilter(WsBatchDetailStatus.Pendiente)}
    className={clsx(
      "px-3 py-1 rounded-full border text-sm font-medium",
      statusFilter === WsBatchDetailStatus.Pendiente
        ? "bg-orange-600 text-white"
        : "border-orange-600 text-orange-600"
    )}
  >
    Pendientes
  </button>
  <button
    onClick={() => setStatusFilter(WsBatchDetailStatus.Fallido)}
    className={clsx(
      "px-3 py-1 rounded-full border text-sm font-medium",
      statusFilter === WsBatchDetailStatus.Fallido
        ? "bg-red-600 text-white"
        : "border-red-600 text-red-600"
    )}
  >
    Fallidos
  </button>
  <button
    onClick={() => setStatusFilter("SIN_ESTADO")}
    className={clsx(
      "px-3 py-1 rounded-full border text-sm font-medium",
      statusFilter === "SIN_ESTADO"
        ? "bg-gray-600 text-white"
        : "border-gray-400 text-gray-600"
    )}
  >
    Sin estado
  </button>
</div>

    <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
        <Table>
            <TableHeader>
            <TableRow>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Celular</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Estado</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Error</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Acciones</TableCell>
            </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
            {paginatedCells.map((cell) => (
                <TableRow key={cell.id}>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.celular.celular}</TableCell>
                   <TableCell className="px-4 py-3 text-start text-theme-sm">
                     <span
                       className={clsx(
                         'px-3 py-1 rounded-full font-medium border text-xs',
                         {
                           'text-green-600 border-green-600 bg-green-50': cell.estado === WsBatchDetailStatus.Enviado,
                           'text-orange-600 border-orange-600 bg-orange-50': cell.estado ===  WsBatchDetailStatus.Pendiente,
                           'text-red-600 border-red-600 bg-red-50': cell.estado ===  WsBatchDetailStatus.Fallido,
                           'text-gray-500 border-gray-300 bg-gray-100': !cell.estado,
                         }
                       )}
                     >
                       {cell.estado.replace('_', ' ') ?? 'Sin estado'}
                     </span>
                   </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.error}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                    <button
                    onClick={() => alert(cell.id)}
                    className="text-red-500 hover:text-red-700 transition-colors dark:text-gray-400"
                    >
                    <Send size={16} />
                    </button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>

        <Pagination
            totalItems={filteredCells.length}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(filteredCells.length / itemsPerPage)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
        />
        </div>
    </div>
    </div>
);
};
  