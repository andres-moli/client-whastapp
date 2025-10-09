import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Modal } from "../../components/ui/modal";
import { formatCurrency, ToastyErrorGraph } from "../../lib/utils";
import {
  useProductsQuery,
  Product,
  OrderTypes,
  useAddRelatedProductMutation,
} from "../../domain/graphql";

interface CreateProductRelationModalProps {
  isOpen: boolean;
  productId: string;
  closeModal: () => void;
  refetch: () => void;
}

export const CreateProductRelationModal: React.FC<CreateProductRelationModalProps> = ({
  isOpen,
  closeModal,
  refetch,
  productId,
}) => {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createRelation] = useAddRelatedProductMutation();

  const { data, loading, refetch: refetchProducts } = useProductsQuery({
    variables: {
      where: {
        _or: [
          { title: { _contains: query } },
          { reference: { _contains: query } },
        ],
      },
      orderBy: {
        title: OrderTypes.Asc,
      },
      pagination: {
        skip: 0,
        take: 10,
      },
    },
    skip: !query,
  });

  useEffect(() => {
    if (query.trim() !== "") {
      refetchProducts();
    }
  }, [query]);

  const handleCreateRelation = async () => {
    if (!selectedProduct) {
      toast.error("Selecciona un producto para relacionar");
      return;
    }

    if (selectedProduct.id === productId) {
      toast.error("No puedes relacionar un producto consigo mismo");
      return;
    }

    try {
      closeModal();
      const result = await Swal.fire({
        title: "¿Relacionar producto?",
        text: `¿Deseas relacionar "${selectedProduct.title}" con este producto?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, relacionar",
        cancelButtonText: "Cancelar",
      });

      if (result.isDismissed) {
        return;
      }

      if (result.isConfirmed) {
        const res = await createRelation({
          variables: {
            productId,
            relatedProductId: selectedProduct.id,
          },
        });

        if (res.errors) {
          toast.error("Error al crear la relación");
          return;
        }

        toast.success("Producto relacionado correctamente");
        refetch();
        setQuery("");
        setSelectedProduct(null);
        closeModal();
      }
    } catch (error) {
      ToastyErrorGraph(error as any);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] p-6 lg:p-10"
    >
      <div className="flex flex-col gap-4 px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90">
          Relacionar producto
        </h5>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o referencia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>

        {/* Resultados */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Cargando...</p>
        ) : (
          query.trim() !== "" && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y dark:divide-gray-700">
              {data?.products?.length ? (
                data.products.map((product) => (
                  <button
                    key={product.id}
                    // @ts-ignore
                    onClick={() => setSelectedProduct(product)}
                    className={`flex items-center gap-4 w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 transition ${
                      selectedProduct?.id === product.id
                        ? "bg-blue-100 dark:bg-gray-700"
                        : ""
                    }`}
                  >
                    <img
                      src={product.file?.url || "/images/no-image.png"}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ref: {product.reference}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Precio: {formatCurrency(product.basePrice)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No se encontraron productos
                </p>
              )}
            </div>
          )
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Cerrar
          </button>
          <button
            onClick={handleCreateRelation}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm text-white hover:bg-brand-600 disabled:opacity-50"
            disabled={!selectedProduct}
          >
            Relacionar producto
          </button>
        </div>
      </div>
    </Modal>
  );
};
