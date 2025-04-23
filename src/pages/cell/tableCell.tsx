import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { OrderTypes, useCellsQuery, useClientsQuery, useClientsUserQuery, useProyectosQuery, WsCell } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency } from "../../lib/utils";
import { Eye, Search } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { CreateCellModal } from "./createModalCellc";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { UpdateCellModal } from "./updateModalCell";

export default function CellTable() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isOpenUpdate, openModal: openModalUpdate, closeModal: closeModalUpdate } = useModal();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [cell, setCell] = useState<WsCell>();
  const [searchTerm, setSearchTerm] = useState("");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const { data, loading, refetch } = useCellsQuery({
    variables: {
      where: {
        ...(searchTerm && {
          _and: [
            { 
              celular: 
              { _contains: searchTerm } ,
              _or: [{
                nombre: {
                  _contains: searchTerm
                },
                _or: [{
                  email: {
                    _contains: searchTerm
                  },
                  _or: [{
                    nit: {
                      _contains: searchTerm
                    },
                    _or: [{
                      direccion: {
                        _contains: searchTerm
                      }
                    }]
                  }]
                }],
              }]
            },
          ]
        })
      },
      orderBy: {
        createdAt: OrderTypes.Desc
      },
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
      }
    }
  });

  // Debounce search to avoid too many requests
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const updateModal = (cell: WsCell) => {
    setCell(cell);
    openModalUpdate();
  }

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
        <ButtonTable onClick={() => openModal()}>
          Subir Excel 
        </ButtonTable>
        <ButtonTable onClick={() => openModal()}>
          Crear Celular
        </ButtonTable>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Celular
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nombre
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data?.Cells.map((cell) => (
                <TableRow key={cell.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.celular}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.nit}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.status}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Eye
                      className="cursor-pointer"
                      //@ts-ignore
                      onClick={() => updateModal(cell)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalItems={data?.CellsCount.totalItems || 0}
            itemsPerPage={data?.CellsCount.itemsPerPage || 0}
            totalPages={Math.ceil((data?.CellsCount.totalItems || 0) / (data?.CellsCount?.itemsPerPage || 0))}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
          <CreateCellModal
            closeModal={closeModal}
            isOpen={isOpen}
            openModal={openModal}
          />
          <UpdateCellModal 
            isOpen={isOpenUpdate}
            closeModal={closeModalUpdate}
            openModal={openModalUpdate}
            cell={cell}
            key={cell?.id}
          />
        </div>
      </div>
    </div>
  );
}