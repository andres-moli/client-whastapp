import { useState, useMemo } from "react";

import { Loader2, ShoppingCart, Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import { OrderTypes, useProductsQuery } from "../../domain/graphql";
import Button from "../../components/ui/button/Button";
import ProductCard from "./cards/ProductsCards";
import { useNavigate } from "react-router";

const itemsPerPage = 12;

export default function ProductList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("referenceAsc");
  const [currentPage, setCurrentPage] = useState(1);

  const whereFilter = useMemo(() => {
    const filters: any = {};
    const conditions: any[] = [];

    if (searchTerm) {
      conditions.push({
        _or: [
          { title: { _contains: searchTerm } },
          { reference: { _contains: searchTerm } },
        ],
      });
    }

    if (minPrice !== undefined) {
      conditions.push({ basePrice: { _gte: minPrice } });
    }

    if (maxPrice !== undefined) {
      conditions.push({ basePrice: { _lte: maxPrice } });
    }

    if (conditions.length > 0) {
      filters._and = conditions;
    }

    return filters;
  }, [searchTerm, minPrice, maxPrice]);

  const orderBy = useMemo(() => {
    switch (sortBy) {
      case "priceAsc":
        return { basePrice: OrderTypes.Asc };
      case "priceDesc":
        return { basePrice: OrderTypes.Desc };
      case "title":
        return { title: OrderTypes.Asc };
      case "reference":
        return { reference: OrderTypes.Asc };
      default:
        return { reference: OrderTypes.Asc };
    }
  }, [sortBy]);

  const { data, loading, refetch } = useProductsQuery({
    variables: {
      where: whereFilter,
      orderBy,
      pagination: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      },
    },
  });

  const products = data?.products ?? [];

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  const totalPages = Math.ceil((data?.productsCount.totalItems ?? 0) / itemsPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
{/* Panel de filtros */}
<div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md space-y-3 text-sm">
  {/* Buscador */}
  <div>
    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">
      Buscar
    </label>
    <div className="relative">
      <input
        type="text"
        placeholder="Nombre o referencia..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-md border px-3 py-1.5 pl-9 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 text-sm"
      />
      <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
    </div>
  </div>

  {/* Filtros de precio */}
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">
        Precio mín.
      </label>
      <div className="relative">
        <input
          type="number"
          value={minPrice ?? ""}
          onChange={(e) =>
            setMinPrice(e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full rounded-md border px-2 py-1.5 pl-6 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 text-sm"
        />
        <span className="absolute left-2 top-2 text-gray-400 text-xs">$</span>
      </div>
    </div>
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">
        Precio máx.
      </label>
      <div className="relative">
        <input
          type="number"
          value={maxPrice ?? ""}
          onChange={(e) =>
            setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full rounded-md border px-2 py-1.5 pl-6 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 text-sm"
        />
        <span className="absolute left-2 top-2 text-gray-400 text-xs">$</span>
      </div>
    </div>
  </div>

  {/* Orden y botón */}
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
    <div className="w-full md:w-1/2">
      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">
        Ordenar por
      </label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full rounded-md border px-2 py-1.5 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 text-sm"
      >
        <option value="reference">Referencia</option>
        <option value="title">Título</option>
        <option value="priceAsc">Precio ↑</option>
        <option value="priceDesc">Precio ↓</option>
      </select>
    </div>
    <Button
      onClick={handleSearch}
      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md"
    >
      <Search size={14} />
      Aplicar
    </Button>
  </div>
</div>


      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium mb-1">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            <option value="reference">Referencia</option>
            <option value="title">Título</option>
            <option value="priceAsc">Precio ascendente</option>
            <option value="priceDesc">Precio descendente</option>
          </select>
        </div>
        <Button onClick={handleSearch}>Aplicar filtros</Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
            <ProductCard 
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                price={product.basePrice}
                imageUrl={product.file?.url ?? undefined}
                onView={(id) => navigate(`/product/${id}`)}
                onAddToCart={(id) => alert(`Añadir al carrito ${id}`)}            
            />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
