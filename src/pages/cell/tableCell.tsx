import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { CellTpeStatusEmun, OrderTypes, useCellsQuery, useCitiesQuery, useClientsQuery, useClientsUserQuery, useProyectosQuery, useUpdateCellMutation, WsCell } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency } from "../../lib/utils";
import { Eye, Search, XCircle } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { useState, useEffect, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { CreateCellModal } from "./createModalCellc";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { UpdateCellModal } from "./updateModalCell";
import { useLoteLoadingToast } from "../../hooks/loadingTable";
import Checkbox from "../../components/form/input/Checkbox";
import { toast } from "sonner";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
const optionsSelected: Option[] = [
  {
    label: 'Ver verificado',
    value: 'VERIFICADO'
  },
  {
    label: 'Ver NO verificado',
    value: 'NO_VERIFICADO'
  },
  {
    label: 'TODOS',
    value: 'TODOS'
  }
]
const typeOption: Option[] = [
  { value: CellTpeStatusEmun.Cliente, label: "Cliente" },
  { value: CellTpeStatusEmun.Proveedor, label: "Proveedor" }
];
export default function CellTable() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isOpenUpdate, openModal: openModalUpdate, closeModal: closeModalUpdate } = useModal();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [cell, setCell] = useState<WsCell>();
  const [searchTerm, setSearchTerm] = useState("");
  const [updateCell] = useUpdateCellMutation();
  const {data: dataCity, loading: loadingCity} = useCitiesQuery({})
  const cityOptions: Option[] = dataCity?.cities.map((city) => {
    return {
      value: city.id,
      label: city.name
    }
  }).sort((a,b) => a.label.localeCompare(b.label)) || []
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
                      },
                      _or: [
                        {
                          empresa: {
                            _eq: searchTerm
                          }
                        }
                      ]
                    }]
                  }]
                }],
              }]
            },
          ]
        })
      },
      orderBy: {
        nombre: OrderTypes.Asc
      },
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
      }
    }
  });
  useLoteLoadingToast(loading, 'Cargando celulares...');

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
  const setIsChecked = async (checked: boolean, id: string) => {
    await updateCell({
      variables: {
        updateInput: {
          id,
          verify: checked
        }
      }
    })
    refetch()
    toast.success(`Celular ${checked ? 'verificado' : 'desverificado'} con exíto...`)
  }
  const handleClearFilters = () => {
    setSearchTerm('')
    refetch({
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
                      },
                      _or: [
                        {
                          empresa: {
                            _eq: searchTerm
                          }
                        }
                      ]
                    }]
                  }]
                }],
              }]
            },
          ]
        })
      },
      orderBy: {
        nombre: OrderTypes.Asc
      },
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
      }
    })
  }
  const filterVerfy = async (str: string) => {
    const toastId = toast.loading('Filtrando...')
    if(str == 'VERIFICADO'){
      await refetch({
        where: {
          verify: {
            _eq: 'true'
          }
        },
        orderBy: {
          nombre: OrderTypes.Asc
        },
        pagination: {
          skip: (currentPage - 1) * itemsPerPage,
          take: itemsPerPage
        }
      })
    }
    if(str == 'NO_VERIFICADO'){
      await refetch({
        where: {
          verify: {
            _eq: 'false'
          }
        },
        orderBy: {
          nombre: OrderTypes.Asc
        },
        pagination: {
          skip: (currentPage - 1) * itemsPerPage,
          take: itemsPerPage
        }
      })
    }
    toast.dismiss(toastId)
  }
  const filterType = async (type: CellTpeStatusEmun) => {
    const toastId = toast.loading('Filtrando...')
    await refetch({
      where: {
        type: {
          _eq: type
        }
      },
      orderBy: {
        nombre: OrderTypes.Asc
      },
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
      }
    })
    toast.dismiss(toastId)
  }
  const filterCity = async (str: string) => {
    const toastId = toast.loading('Filtrando...')
    await refetch({
      where: {
        city: {
          _eq: str
        }
      },
      orderBy: {
        nombre: OrderTypes.Asc
      },
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
      }
    })
    toast.dismiss(toastId)
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
<div className="p-4 flex flex-col gap-4">
  {/* Fila de búsqueda y filtros */}
  <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
    {/* Input de búsqueda */}
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar por celular o nombre..."
        className="pl-10 w-full"
        onChange={handleSearchChange}
      />
    </div>

    {/* Selects */}
    <SearchableSelect
      options={optionsSelected}
      placeholder="Selecciona una opción"
      onChange={(value) => filterVerfy(value)}
    />
    <SearchableSelect
      options={typeOption}
      placeholder="Selecciona una opción"
      onChange={(value) => filterType(value as CellTpeStatusEmun)}
    />
    <SearchableSelect
      options={cityOptions}
      placeholder="Selecciona una ciudad"
      onChange={(value) => filterCity(value)}
    />

    {/* Botón de limpiar filtros */}
    <button
      onClick={handleClearFilters}
      className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
      title="Borrar filtros"
    >
      <XCircle className="h-5 w-5" />
    </button>
  </div>

  {/* Botón de crear */}
  <div className="w-full flex justify-end">
    <ButtonTable onClick={() => openModal()}>
      Crear Celular
    </ButtonTable>
  </div>
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
                  Tipo
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
                  Empresa
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
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ciudad
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
                    {cell.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.empresa}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.nit}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cell.city?.name}
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
                   <Checkbox checked={cell.verify || false} onChange={(check) => {
                      setIsChecked(check,cell.id)
                   }} />
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