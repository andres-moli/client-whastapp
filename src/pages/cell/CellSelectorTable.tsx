import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useCellsQuery, OrderTypes, WsCell, useCellsLazyQuery } from "../../domain/graphql";
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { Pagination } from "../../components/ui/table/pagination";

type Props = {
    onSelectionChange: (selectedIds: string[]) => void;
};

export const CellSelectorTable = ({ onSelectionChange }: Props) => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loadAllCells] = useCellsLazyQuery();
    const { data, loading } = useCellsQuery({
        variables: {
            where: {
                ...(searchTerm && {
                    _or: [
                        { celular: { _contains: searchTerm } },
                        { nombre: { _contains: searchTerm } },
                        { email: { _contains: searchTerm } },
                        { nit: { _contains: searchTerm } },
                        { direccion: { _contains: searchTerm } },
                    ],
                }),
            },
            orderBy: { createdAt: OrderTypes.Desc },
            pagination: {
                skip: (currentPage - 1) * itemsPerPage,
                take: itemsPerPage,
            },
        },
    });

    const debouncedSearch = useMemo(
        () =>
            debounce((term: string) => {
                setSearchTerm(term);
                setCurrentPage(1);
            }, 500),
        []
    );

    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };

    const toggleSelection = (id: string) => {
        const updated = selectedIds.includes(id)
            ? selectedIds.filter((item) => item !== id)
            : [...selectedIds, id];

        setSelectedIds(updated);
        onSelectionChange(updated);
    };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleItemsPerPageChange = (n: number) => {
        setItemsPerPage(n);
        setCurrentPage(1);
    };

    // Selección múltiple
    const allVisibleIds = data?.Cells.map((cell) => cell.id) || [];

    const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
    const isPartiallySelected = allVisibleIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

    const toggleSelectAll = async () => {
        if (isAllSelected) {
            const updated = selectedIds.filter((id) => !allVisibleIds.includes(id));
            setSelectedIds(updated);
            onSelectionChange(updated);
        } else {
            // Si ya se cargaron todos en esta página y total === cantidad cargada, seleccionamos visibles
            const totalItems = data?.CellsCount.totalItems || 0;
            const currentItems = data?.Cells.length || 0;
    
            if (currentItems >= totalItems) {
                const updated = Array.from(new Set([...selectedIds, ...allVisibleIds]));
                setSelectedIds(updated);
                onSelectionChange(updated);
            } else {
                // Llamar al backend para traer todos los IDs que coincidan con el filtro
                const { data: allData } = await loadAllCells({
                    variables: {
                        where: {
                            ...(searchTerm && {
                                _or: [
                                    { celular: { _contains: searchTerm } },
                                    { nombre: { _contains: searchTerm } },
                                    { email: { _contains: searchTerm } },
                                    { nit: { _contains: searchTerm } },
                                    { direccion: { _contains: searchTerm } },
                                ],
                            }),
                        },
                        orderBy: { createdAt: OrderTypes.Desc },
                        pagination: {
                            skip: 0,
                            take: data?.CellsCount.totalItems || 999999, // puedes ajustar el límite máximo si tu backend lo permite
                        },
                    },
                });
    
                const allIds = allData?.Cells.map((cell) => cell.id) || [];
                const updated = Array.from(new Set([...selectedIds, ...allIds]));
    
                setSelectedIds(updated);
                onSelectionChange(updated);
            }
        }
    };
    

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex justify-between items-center p-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por celular o nombre..."
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
                                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isPartiallySelected;
                                        }}
                                        onChange={toggleSelectAll}
                                    />
                                </TableCell>
                                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Celular
                                </TableCell>
                                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Nombre
                                </TableCell>
                                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Email
                                </TableCell>
                                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Nit
                                </TableCell>
                                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Estado
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100">
                            {data?.Cells.map((cell) => (
                                <TableRow key={cell.id}>
                                    <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(cell.id)}
                                            onChange={() => toggleSelection(cell.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                                        {cell.celular}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                                        {cell.nombre}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                                        {cell.email}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                                        {cell.nit}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                                        {cell.status}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination
                        totalItems={data?.CellsCount.totalItems || 0}
                        itemsPerPage={itemsPerPage}
                        totalPages={Math.ceil((data?.CellsCount.totalItems || 0) / itemsPerPage)}
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
