import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import Button from "../../../components/ui/button/Button";

type ProductCardProps = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
};

export default function ProductCard({
  id,
  title,
  description,
  price,
  imageUrl,
  onView,
  onAddToCart,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl shadow-md bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
    >
      {/* Imagen */}
      <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="object-cover h-full w-full"
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-primary font-bold mt-2">
            ${price.toLocaleString()}
          </p>
          <div className="flex items-center text-yellow-500 mt-1">
            {"★".repeat(4)}☆ {/* Dummy rating */}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex items-center gap-1"
            onClick={() => onView(id)}
          >
            <Eye className="w-4 h-4" /> Ver producto
          </Button>
          <Button
            size="sm"
            className="flex-1 flex items-center gap-1"
            onClick={() => onAddToCart(id)}
          >
            <ShoppingCart className="w-4 h-4" /> Agregar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
