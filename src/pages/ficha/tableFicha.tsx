import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { FichaTecnica, OrderTypes, useClientsQuery, useClientsUserQuery, useFichaTecnicasQuery, useProyectosQuery } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency } from "../../lib/utils";
import { AlertTriangleIcon, Eye, FileIcon, FileQuestion, FileWarning, Search } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo, use } from "react";
import { useModal } from "../../hooks/useModal";
import { CreateBasicModal } from "./createModalFicha";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { UpdateFichaModal } from "./updateModalFicha";

export default function FichaTable() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [fichaTecnica, setFichaTecnica] = useState<FichaTecnica | null>(null);
  const [hasFileFilter, setHasFileFilter] = useState<'all' | 'yes' | 'no'>('all');
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  const whereFilter = useMemo(() => {
    const filters: any[] = [];

    if (searchTerm) {
      filters.push({
        _or: [
          { referencia: { _contains: searchTerm } },
          { description: { _contains: searchTerm } },
        ],
      });
    }

    if (hasFileFilter === 'yes') {
      filters.push({ file: { _isNotNull: true } });
    } else if (hasFileFilter === 'no') {
      filters.push({ file: { _isNull: true } });
    }

    return filters.length > 0 ? { _and: filters } : undefined;
  }, [searchTerm, hasFileFilter]);

  const { data, loading, refetch } = useFichaTecnicasQuery({
    variables: {
      where: whereFilter,
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
  const update = (ficha: FichaTecnica) => {
    setFichaTecnica(ficha);
    openModal();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-4">
<div className="flex items-center gap-2 w-full max-w-md">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input
      type="text"
      placeholder="Buscar por referencia o descripción..."
      className="pl-10 w-full"
      onChange={handleSearchChange}
    />
  </div>

  <select
    className="text-sm border rounded-md px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
    onChange={(e) => setHasFileFilter(e.target.value as 'all' | 'yes' | 'no')}
    value={hasFileFilter}
  >
    <option value="all">Todos</option>
    <option value="yes">Con archivo</option>
    <option value="no">Sin archivo</option>
  </select>
</div>

        <ButtonTable onClick={() => openModal()}>
          Crear Ficha
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
                  Referencia
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
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Archivo
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
              {data?.fichaTecnicas.map((ficha) => (
                <TableRow key={ficha.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.referencia}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.status}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {
                      ficha.file ?
                      <FileIcon
                        className="h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={() => {
                          window.open(ficha.file?.url, "_blank"); 
                        }}
                      />
                      :
                      <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
                    }

                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Eye
                      className="cursor-pointer"
                      onClick={() => update(ficha)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalItems={data?.fichaTecnicasCount.totalItems || 0}
            itemsPerPage={data?.fichaTecnicasCount.itemsPerPage || 0}
            totalPages={Math.ceil((data?.fichaTecnicasCount.totalItems || 0) / (data?.fichaTecnicasCount?.itemsPerPage || 0))}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
          <CreateBasicModal
            closeModal={closeModal}
            isOpen={isOpen}
            openModal={openModal}
          />
          <UpdateFichaModal
            closeModal={closeModal}
            isOpen={isOpen}
            openModal={openModal}
            ficha={fichaTecnica || undefined}
            key={fichaTecnica?.id} // Cambia la key para forzar el reinicio
          />
        </div>
      </div>
    </div>
  );
}