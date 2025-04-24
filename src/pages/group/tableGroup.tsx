import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { OrderTypes, useClientsQuery, useClientsUserQuery, useGroupsQuery, useProyectosQuery, WsGroup } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency } from "../../lib/utils";
import { Eye, Search } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { CreateGrupoExcelModal } from "./createModalBasic";
import { useLoteLoadingToast } from "../../hooks/loadingTable";

export default function GroupTable() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [group, setGruoup] = useState<WsGroup>();
  const {closeModal, isOpen, openModal} = useModal();
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const { data, loading, refetch } = useGroupsQuery({
    variables: {
      where: {
        ...(searchTerm && {
          _and: [
            { 
              descripcion: 
              { _contains: searchTerm } ,
              _or: [{
                nombre: {
                  _contains: searchTerm
                }
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
  useLoteLoadingToast(loading, 'Cargando grupos...');

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
  const onGroupClick = (group: WsGroup) => {
    navigate(`/group/${group.id}`);
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            className="pl-10 w-full"
            onChange={handleSearchChange}
          />
        </div>
        <ButtonTable onClick={openModal}>
          Crear desde excel
        </ButtonTable>
        <ButtonTable onClick={() => navigate(`/group-create`)}>
          Crear Grupo
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
                  Nombre
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Descripción
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trabajador
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Cantidad de telefonos
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Accion
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data?.groups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {group.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {group.descripcion}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {group.worker ? group.worker.fullName : "No asignado"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {group.wsGroupCells?.length}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Eye
                      className="cursor-pointer"
                      //@ts-ignore
                      onClick={() => onGroupClick(group)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalItems={data?.groupsCount.totalItems || 0}
            itemsPerPage={data?.groupsCount.itemsPerPage || 0}
            totalPages={Math.ceil((data?.groupsCount.totalItems || 0) / (data?.groupsCount?.itemsPerPage || 0))}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
        </div>
      </div>
      <CreateGrupoExcelModal 
        closeModal={closeModal}
        isOpen={isOpen} 
        openModal={openModal}
      />
    </div>
  );
}