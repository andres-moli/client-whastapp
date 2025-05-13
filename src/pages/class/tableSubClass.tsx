import {
  ButtonTable,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { SubClass } from "../../domain/graphql";
import { useState, useEffect, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { debounce } from "lodash";
import Input from "../../components/form/input/InputField";
import { Search, Eye } from "lucide-react";
import { Pagination } from "../../components/ui/table/pagination";
import { CreateSubClassModal } from "./CreateSubClassModal";

export default function SubClassTable({ subClass, cllasId, refetch }: { subClass: SubClass[], cllasId: string, refetch: () => void }) {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isOpenUpdate, openModal: openModalUpdate, closeModal: closeModalUpdate } = useModal();

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term.toLowerCase());
        setCurrentPage(1);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const filteredSubClasses = useMemo(() => {
    return subClass.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchTerm) ||
        sub.description?.toLowerCase().includes(searchTerm)
    );
  }, [searchTerm, subClass]);

  const paginatedSubClasses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSubClasses.slice(start, end);
  }, [filteredSubClasses, currentPage, itemsPerPage]);

  const onUpdate = (subClass: SubClass) => {
    subClass
    openModalUpdate();
    // aquí puedes guardar `subClass` en estado o contexto para editar
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar subclases..."
            className="pl-10 w-full"
            onChange={handleSearchChange}
          />
        </div>
        <ButtonTable onClick={() => openModal()}>Crear Subclase</ButtonTable>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500">Nombre</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500">Descripción</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500">Estado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500">Acciones</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedSubClasses.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500">{sub.name}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500">{sub.description}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500">{sub.status}</TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                    <Eye className="cursor-pointer" onClick={() => onUpdate(sub)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            totalItems={filteredSubClasses.length}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(filteredSubClasses.length / itemsPerPage)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
            <CreateSubClassModal
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal}
                classId={cllasId}
                key={cllasId}
                refetch={refetch}
            />
        </div>
      </div>
    </div>
  );
}
