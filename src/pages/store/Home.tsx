import React, { useMemo, useState, useEffect } from "react";
import { useProductsQuery, OrderTypes } from "../../domain/graphql";
import {
  Loader2,
  Package,
  Star,
  Percent,
  Truck,
  RefreshCcw,
  ShoppingBag,
} from "lucide-react";
import ProductCard from "./cards/ProductsCards";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import StoreHeader from "../../layout/StoreHeader";

const DASHBOARD_FETCH = 60;

export default function DashboardStore() {
  const navigate = useNavigate();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const { data, loading, refetch } = useProductsQuery({
    variables: {
      where: {},
      orderBy: { basePrice: OrderTypes.Desc },
      pagination: { skip: 0, take: DASHBOARD_FETCH },
    },
  });

  const products = data?.products ?? [];
  const totalItems = data?.productsCount?.totalItems ?? products.length;

  const featured = useMemo(() => products.slice(0, 6), [products]);
  const discounted = useMemo(
    () =>
      products.filter((p: any) => (p.priceRules?.length ?? 0) > 0).slice(0, 6),
    [products]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, page]);

  const carouselItems = [
    {
      title: "Envío gratis a partir de $500.000",
      subtitle: "Aplica para todo el país.",
      image:
        "https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      title: "Nueva colección 2025",
      subtitle: "Moda y tecnología con estilo premium.",
      image:
        "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      title: "Soporte técnico 24/7",
      subtitle: "Asistencia profesional siempre disponible.",
      image:
        "https://images.pexels.com/photos/3945636/pexels-photo-3945636.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
  ];

  const quickNews = [
    {
      icon: <Truck className="text-green-600" size={20} />,
      title: "Promoción de envío",
      subtitle: "Gratis hasta 30 de octubre",
    },
    {
      icon: <Package className="text-blue-600" size={20} />,
      title: "Nuevo proveedor agregado",
      subtitle: "Mejores tiempos de entrega",
    },
    {
      icon: <Star className="text-yellow-500" size={20} />,
      title: "Clientes VIP",
      subtitle: "Beneficios exclusivos",
    },
    {
      icon: <Percent className="text-red-500" size={20} />,
      title: "Semana de descuentos",
      subtitle: "Hasta -40% en toda la tienda",
    },
  ];

  const nextCarousel = () =>
    setCarouselIndex((i) => (i + 1) % carouselItems.length);
  const prevCarousel = () =>
    setCarouselIndex((i) => (i - 1 + carouselItems.length) % carouselItems.length);

  useEffect(() => {
    const interval = setInterval(() => {
      nextCarousel();
    }, 7000);
    return () => clearInterval(interval);
  }, [carouselIndex]);

  const handleRefresh = async () => {
    setPage(1);
    await refetch();
  };

  return (
    <>
    {/* <StoreHeader user={{ name: "Carlos" }} cartCount={3} /> */}
      {/* Carrusel tipo tienda full width */}
      <div className="w-full relative">
        <div className="relative w-full h-[60vh] overflow-hidden">
          <img
            src={carouselItems[carouselIndex].image}
            alt={carouselItems[carouselIndex].title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-6">
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              {carouselItems[carouselIndex].title}
            </h2>
            <p className="text-lg md:text-xl">{carouselItems[carouselIndex].subtitle}</p>
            {/* <div className="flex gap-4 mt-6">
              <Button  onClick={prevCarousel}>Anterior</Button>
              <Button onClick={nextCarousel}>Siguiente</Button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <PageMeta title="Tienda Cytech" description="Dashboard de la tienda online" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="text-brand-600" /> Dashboard de la tienda
            </h1>
            <p className="text-sm text-gray-500">Resumen rápido de desempeño y productos</p>
          </div> */}
          <div className="flex gap-2">
            <Button onClick={() => navigate("/catalog")} className="px-3 py-1.5 text-sm flex items-center gap-2">
              <Package size={16} /> Ver catálogo
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="px-3 py-1.5 text-sm flex items-center gap-2">
              <RefreshCcw size={16} /> Refrescar
            </Button>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <Package className="text-brand-600" />
            <div>
              <div className="text-sm text-gray-500">Total de productos</div>
              <div className="text-2xl font-semibold">{totalItems}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <Star className="text-yellow-500" />
            <div>
              <div className="text-sm text-gray-500">Productos destacados</div>
              <div className="text-2xl font-semibold">{featured.length}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <Percent className="text-red-500" />
            <div>
              <div className="text-sm text-gray-500">Productos con descuento</div>
              <div className="text-2xl font-semibold">{discounted.length}</div>
            </div>
          </div>
        </div> */}

        {/* Carrusel horizontal de tarjetas de noticias */}
        <div className="space-y-2">
          <h4 className="text-md font-semibold text-gray-700 dark:text-white">Noticias rápidas</h4>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {quickNews.map((item, idx) => (
              <div
                key={idx}
                className="min-w-[250px] bg-gray-50 dark:bg-gray-900 rounded-md p-4 flex items-start gap-3 shadow-sm"
              >
                {item.icon}
                <div>
                  <strong className="block">{item.title}</strong>
                  <span className="text-xs text-gray-500">{item.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos destacados */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="text-yellow-500" /> Productos destacados
            </h2>
            <Button variant="outline" onClick={() => navigate("/products?filter=featured")} className="text-sm px-3 py-1.5">
              Ver todos
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featured.length === 0 ? (
                <div className="text-sm text-gray-500">No hay productos destacados</div>
              ) : (
                featured.map((p: any) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    description={p.description}
                    price={p.basePrice}
                    imageUrl={p.file?.url ?? undefined}
                    onView={(id) => navigate(`/product/${id}`)}
                    onAddToCart={(id) => console.log("add to cart", id)}
                  />
                ))
              )}
            </div>
          )}
        </section>

        {/* Productos en descuento */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Percent className="text-red-500" /> Productos en descuento
            </h2>
            <Button variant="outline" onClick={() => navigate("/products?filter=discounts")} className="text-sm px-3 py-1.5">
              Ver todos
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {discounted.length === 0 ? (
                <div className="text-sm text-gray-500">No hay descuentos activos</div>
              ) : (
                discounted.map((p: any) => {
                  const maxRule = (p.priceRules ?? []).reduce(
                    (m: any, r: any) => (r.percentage > (m?.percentage ?? 0) ? r : m),
                    null
                  );
                  const discountPct = maxRule?.percentage ?? 0;
                  const discountedPrice = p.basePrice - (p.basePrice * discountPct) / 100;
                  return (
                    <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                      <ProductCard
                        id={p.id}
                        title={p.title}
                        description={p.description}
                        price={discountedPrice}
                        imageUrl={p.file?.url ?? undefined}
                        onView={(id) => navigate(`/product/${id}`)}
                        onAddToCart={(id) => console.log("add to cart", id)}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="line-through mr-2 text-xs text-gray-400">{p.basePrice.toLocaleString()}</span>
                        <span className="text-xs font-medium text-green-600">-{discountPct}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* Paginación */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Explorar productos</h2>
            <div className="flex items-center gap-2 text-sm">
              <span>Página {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paginated.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay productos para mostrar.</div>
                ) : (
                  paginated.map((p: any) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      title={p.title}
                      description={p.description}
                      price={p.basePrice}
                      imageUrl={p.file?.url ?? undefined}
                      onView={(id) => navigate(`/product/${id}`)}
                      onAddToCart={(id) => console.log("add to cart", id)}
                    />
                  ))
                )}
              </div>
              <div className="flex justify-center items-center gap-3 mt-6">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Anterior
                </Button>
                <span className="text-sm">Página {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginated.length < itemsPerPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
