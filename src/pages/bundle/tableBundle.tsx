import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { OrderTypes, useBundlesQuery, useClientsQuery, useClientsUserQuery, useProyectosQuery, useSendLoteMessagesMutation, WsBatch, WsBatchStatus } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency, ToastyErrorGraph } from "../../lib/utils";
import { Eye, Search, SendIcon } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { CreateBundleModal } from "./createModalBundle";
import Swal from "sweetalert2";
import clsx from "clsx";
import { toast } from "sonner";
import { useLoteLoadingToast } from "../../hooks/loadingTable";

export default function BundleTable() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [bundleSelected, setBundleSelected] = useState<WsBatch>();
  const [sendBundle] = useSendLoteMessagesMutation()

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const { data, loading, refetch } = useBundlesQuery({
    variables: {
      where: {
        ...(searchTerm && {
          _and: [
            { 
              nombre: 
              { _contains: searchTerm } ,
              _or: [{
                descripcion: {
                  _contains: searchTerm
                },
                estado: {
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
 
  useLoteLoadingToast(loading, 'Cargando lotes...');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  const onUpdate = (bundle: WsBatch) => { 
    navigate(`/bundle/${bundle.id}`);
  }

  const onSend = async (bundleId: string) => {
    try {
      const confirm = await Swal.fire({
        title: "¿Enviar lote?",
        text: "¿Deseas enviar este lote?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, Enviar",
        cancelButtonText: "Cancelar"
      });
      if(confirm.isConfirmed) {
        const res = await sendBundle({
          variables: {
            sendLoteMessagesId: bundleId
          }
        });
        refetch()
        if(res.data?.sendLoteMessages.success) {
          Swal.fire({
            title: "Éxito",
            text: "Lote enviado correctamente",
            icon: "success",
            confirmButtonText: "Aceptar"
          });
          return
        } 
        else {
          Swal.fire({
            title: "No se pudo enviar el lote",
            text: res.data?.sendLoteMessages.message,
            icon: "error",
            confirmButtonText: "Aceptar"
          });
          return
        }
      }
    } catch (err) {
      ToastyErrorGraph(err as any);
    }
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o documento..."
            className="pl-10 w-full"
            onChange={handleSearchChange}
          />
        </div>
        <ButtonTable onClick={() => openModal()}>
          Crear Lote
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
                  Mensaje
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Grupo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tiene Archivo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Fecha
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
              {data?.bundles.map((bundle) => (
                <TableRow key={bundle.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {bundle.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {bundle.descripcion}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {bundle.message.trim().length > 30 ? `${bundle.message.substring(0, 30)}...` : bundle.message}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {bundle.group?.nombre || 'Sin grupo'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {bundle.file ? 'SI' : 'NO'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {bundle.createdAt}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={clsx(
                        'px-3 py-1 rounded-full font-medium border text-xs',
                        {
                          'text-green-600 border-green-600 bg-green-50': bundle.estado === WsBatchStatus.Completado,
                          'text-orange-600 border-orange-600 bg-orange-50': bundle.estado ===  WsBatchStatus.EnProceso,
                          'text-yellow-600 border-yellow-600 bg-yellow-50': bundle.estado ===  WsBatchStatus.Pendiente,
                          'text-blue-600 border-blue-600 bg-blue-50': bundle.estado ===  WsBatchStatus.Pausado,
                          'text-red-600 border-red-600 bg-red-50': bundle.estado ===  WsBatchStatus.Fallido,
                          'text-gray-500 border-gray-300 bg-gray-100': !bundle.estado,
                        }
                      )}
                    >
                      {bundle.estado.replace('_', ' ') ?? 'Sin estado'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Eye
                      className="cursor-pointer"
                      //@ts-ignore
                      onClick={() => onUpdate(bundle)}
                    />
                    <SendIcon
                      className="cursor-pointer"
                      onClick={() => onSend(bundle.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalItems={data?.bundlesCount.totalItems || 0}
            itemsPerPage={data?.bundlesCount.itemsPerPage || 0}
            totalPages={Math.ceil((data?.bundlesCount.totalItems || 0) / (data?.bundlesCount?.itemsPerPage || 0))}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
          <CreateBundleModal
            closeModal={closeModal}
            isOpen={isOpen}
            openModal={openModal}
          />
        </div>
      </div>
    </div>
  );
}