import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { FichaTecnica, OrderTypes, useClientsQuery, useClientsUserQuery, useFichaTecnicasQuery, useProductsQuery, useProyectosQuery, useRemoveFichaTecnicaMutation } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency, ToastyErrorGraph } from "../../lib/utils";
import { AlertTriangleIcon, Eye, FileIcon, FileQuestion, FileWarning, Search, Trash2 } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo, use } from "react";
import { useModal } from "../../hooks/useModal";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { toast } from "sonner";

export default function FichaTable() {
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasFileFilter, setHasFileFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [removedFicha] = useRemoveFichaTecnicaMutation()
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

  const { data, loading, refetch } = useProductsQuery({
    variables: {
      where: whereFilter,
      orderBy: {
        reference: OrderTypes.Asc 
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

  const onRemoveFicha = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta ficha?")) {  
      try {
        const res = await removedFicha({
          variables: {
            removeFichaTecnicaId: id
          }
        });
        if(res.data?.removeFichaTecnica) {
          toast.success("Ficha eliminada correctamente");
          refetch();
        }
        if(res.errors) {
          toast.error("Error al eliminar la ficha");
        }
      } catch (error) {
        ToastyErrorGraph(error as any);
        console.error("Error al eliminar la ficha:", error);
      }
    }
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
            <option value="yes">Activo</option>
            <option value="no">Inactivo</option>
          </select>
        </div>
        <ButtonTable onClick={() => navigate('/create-product')}>
          Crear Producto
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
                  Archivo
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
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data?.products.map((ficha) => (
                <TableRow key={ficha.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.reference}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.basePrice ? formatCurrency(ficha.basePrice) : 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {ficha.active ? 'Activo' : 'Inactivo'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Eye
                      className="cursor-pointer"
                      onClick={() => navigate(`/edit-products/${ficha.id}`)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Trash2
                      className="ml-2 cursor-pointer"
                      onClick={() => onRemoveFicha(ficha.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalItems={data?.productsCount.totalItems || 0}
            itemsPerPage={data?.productsCount.itemsPerPage || 0}
            totalPages={Math.ceil((data?.productsCount.totalItems || 0) / (data?.productsCount?.itemsPerPage || 0))}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
}