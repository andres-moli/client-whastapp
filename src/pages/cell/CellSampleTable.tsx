import {
Table,
TableBody,
TableCell,
TableHeader,
TableRow,
} from "../../components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import Input from "../../components/form/input/InputField";
import { Pagination } from "../../components/ui/table/pagination";
import { debounce } from "lodash";
import { WsCell } from "../../domain/graphql";


type Props = {
cells: WsCell[];
onDelete: (id: string) => void;
};

export const CellSampleTable = ({ cells, onDelete }: Props) => {
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState("");

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
    return cells.filter(
    (cell) =>
        cell.celular.toLowerCase().includes(searchTerm) ||
        cell.nombre?.toLowerCase().includes(searchTerm) ||
        cell.email?.toLowerCase().includes(searchTerm) ||
        cell.nit.toLowerCase().includes(searchTerm)
    );
}, [cells, searchTerm]);

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

    <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
        <Table>
            <TableHeader>
            <TableRow>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Celular</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Nombre</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Nit</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Estado</TableCell>
                <TableCell className="px-5 py-3 font-medium text-start text-gray-500 text-theme-xs dark:text-gray-400">Acciones</TableCell>
            </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
            {paginatedCells.map((cell) => (
                <TableRow key={cell.id}>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.celular}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.nombre}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.email}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.nit}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">{cell.status}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                    <button
                    onClick={() => onDelete(cell.id)}
                    className="text-red-500 hover:text-red-700 transition-colors dark:text-gray-400"
                    >
                    <Trash2 size={16} />
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
  