import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, FileText, ChevronLeft, ChevronRight, ArrowLeft, Star } from "lucide-react";
import Button from "../../components/ui/button/Button";
import { useProductQuery } from "../../domain/graphql";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return <div className="text-center py-10">ID de producto no proporcionado</div>;

  const { data, loading } = useProductQuery({
    variables: { productId: id },
  });

  const product = data?.product;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (loading) return <div className="flex justify-center items-center py-10">Cargando...</div>;
  if (!product) return <div className="text-center py-10">Producto no encontrado</div>;

  const images = product.photos?.map((p) => p.file?.url).filter(Boolean) ?? [];
  const mainImage = images[currentIndex] ?? product.file?.url;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const reviews = [
    { id: 1, user: "Ana Gómez", rating: 5, comment: "Excelente calidad, me encantó el producto." },
    { id: 2, user: "Carlos Pérez", rating: 4, comment: "Muy bueno, aunque podría mejorar el empaque." },
    { id: 3, user: "Laura Martínez", rating: 3, comment: "Cumple lo esperado, pero nada sobresaliente." },
  ];
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <PageMeta
        title={`${ loading ? 'Cargando...' : product.title}`}
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/* Carrusel */}
<div className="relative">
  <motion.img
    key={mainImage}
    src={mainImage}
    alt={product.title}
    className="w-full h-96 object-contain rounded-lg shadow-md bg-white"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ scale: 1.1 }}   // zoom suave en hover
    whileTap={{ scale: 0.95 }}    // efecto al presionar
  />
  {images.length > 1 && (
    <>
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 dark:bg-gray-800 p-2 rounded-full shadow-md"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 dark:bg-gray-800 p-2 rounded-full shadow-md"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </>
  )}
  {/* Thumbnails */}
  <div className="flex gap-2 mt-4 overflow-x-auto">
    {images.map((img, i) => (
    <motion.img
      key={i}
      src={img}
      alt={`Foto ${i + 1}`}
      onClick={() => setCurrentIndex(i)}
      className={`w-20 h-20 object-cover rounded-md cursor-pointer border ${
        i === currentIndex
          ? "border-brand-500"
          : "border-gray-200 dark:border-gray-700"
      }`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    />
    ))}
  </div>

  {/* Reseñas debajo del carrusel */}
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-2">Reseñas</h2>
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-500">
        {averageRating.toFixed(1)} / 5 ({reviews.length} reseñas)
      </span>
    </div>
    <div className="space-y-4 max-h-60 overflow-y-auto">
      {reviews.map((r) => (
        <div key={r.id} className="border-b pb-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{r.user}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
        </div>
      ))}
    </div>
  </div>
</div>


        {/* Información */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <p className="text-sm text-gray-500">Ref: {product.reference}</p>
          </div>

          <div className="text-2xl font-semibold text-brand-600">
            ${product.basePrice.toLocaleString("es-CO")}
          </div>

          {/* Cantidad */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Cantidad:</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded-md border px-2 py-1 dark:bg-gray-900 dark:border-gray-700"
            />
          </div>

          {/* Botón carrito */}
          <Button className="flex items-center gap-2">
            <ShoppingCart size={18} />
            Agregar al carrito
          </Button>

          {/* Descripción */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Ficha técnica */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Ficha técnica</h2>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText size={16} />
              Ver documento
            </Button>
          </div>

          {/* Subclases */}
          {(product?.subclasses?.length || 0) > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Categorías</h2>
              <div className="flex flex-wrap gap-2">
                {product?.subclasses?.map((sc) => (
                  <span
                    key={sc.id}
                    className="px-3 py-1 text-xs rounded-full bg-brand-100 text-brand-700"
                  >
                    {sc.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
