// src/pages/ClassesPage.tsx
import { useState } from "react";
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronRightCircle, Layers } from "lucide-react";
import { useNavigate } from "react-router";
import { OrderTypes, useClassesQuery } from "../../domain/graphql";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import PageMeta from "../../components/common/PageMeta";

const itemsPerPage = 18;

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const navigate = useNavigate();

  const { data, loading, refetch } = useClassesQuery({
    variables: {
      where: {
        ...(searchTerm && {
          _and: [
            {
              name: { _contains: searchTerm },
              _or: [{ description: { _contains: searchTerm } }],
            },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const classes = data?.Classes ?? [];
  const totalPages = data?.ClassesCount?.totalPages ?? 1;

  const renderCard = (item: any, onClick: () => void, showSubCount = false) => (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl shadow-md bg-white dark:bg-gray-800 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between p-6 h-44"
    >
      <div>
        <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
          {item.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-3">
        {showSubCount && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Layers size={16} />
            {item.subclasses?.length ?? 0} subclases
          </div>
        )}
        <ChevronRightCircle
          className="text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors"
          size={28}
        />
      </div>
    </div>
  );

  return (
    <div className=" dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <PageMeta
        title="Clases y Subclases"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* Header */}
      <div className="flex items-center mb-6 gap-4">
        {selectedClass ? (
          <Button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Volver
          </Button>
        ) : (
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
            
          >
            <ArrowLeft size={18} />
            Volver
          </Button>
        )}
        <h1 className="text-2xl font-bold">
          {selectedClass ? selectedClass.name : "Clases y Subclases"}
        </h1>
      </div>

      {/* Buscador */}
      {!selectedClass && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="Buscar clases o subclases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-gray-800"
          />
          {/* <Button className="flex items-center gap-2">
            <Search size={16} /> Buscar
          </Button> */}
        </form>
      )}

      {/* Contenido */}
      {loading ? (
        <p>Cargando...</p>
      ) : selectedClass ? (
        // Subclases
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {selectedClass.subclasses?.map((sub: any) =>
            renderCard(sub, () => navigate(`/catalog/${sub.id}`))
          )}
        </div>
      ) : (
        // Clases
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls: any) =>
            renderCard(cls, () => setSelectedClass(cls), true)
          )}
        </div>
      )}

      {/* Paginación */}
      {!selectedClass && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <ChevronLeft size={18} />
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={classes.length < itemsPerPage || currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Siguiente
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
