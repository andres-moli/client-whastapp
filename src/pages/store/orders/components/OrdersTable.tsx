import { useNavigate } from "react-router";
import { Eye, CreditCard, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import clsx from "clsx";
import { useUser } from "../../../../context/UserContext";
import { OrderStatus, OrderTypes, useOrdersQuery, useUpdateOrderMutation } from "../../../../domain/graphql";
import PageMeta from "../../../../components/common/PageMeta";
import { formatCurrency } from "../../../../lib/utils";
import { Pagination } from "../../../../components/ui/table/pagination";

export function OrdersTable() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // 🔍 Nuevos filtros
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updateOrder] = useUpdateOrderMutation()
  const { data, loading, refetch } = useOrdersQuery({
    variables: {
      where: {
        ...(statusFilter && { status: { _eq: statusFilter } }),
        ...(dateFrom && { createdAt: { _gte: new Date(dateFrom).toISOString() } }),
        ...(dateTo && { createdAt: { _lte: new Date(dateTo).toISOString() } }),
      },
      orderBy: {
        createdAt: OrderTypes.Desc
      },
      pagination: { skip: (currentPage - 1) * itemsPerPage, take: itemsPerPage },
    },
  });

  useEffect(() => {
    refetch();
  }, [dateFrom, dateTo, statusFilter, currentPage, itemsPerPage, refetch]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const onView = (id: string) => navigate(`/orders-detail/${id}`);

  const handleCancelOrder = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Cancelar orden?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#EF4444",
    });

    if (result.isConfirmed) {
      await updateOrder({
        variables: {
          updateInput: {
            id: id,
            status: OrderStatus.Cancelled
          }
        }
      })
      Swal.fire("Orden cancelada", "La orden fue cancelada correctamente.", "success");
      refetch();
    }
  };

  const handlePayOrder = (id: string) => {
    Swal.fire({
      title: "Estamos generando tu link de pago 💳",
      text: "Espera unos segundos...",
      icon: "info",
      showConfirmButton: false,
      timer: 2500,
    });

    setTimeout(() => {
      navigate(`/checkout/${id}`);
    }, 2500);
  };

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/70 shadow-sm backdrop-blur-md transition-all">
      <PageMeta title="Ordenes" description="mis"/>
      {/* 🧭 Header con filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Mis órdenes
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full sm:w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full sm:w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full sm:w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
            >
              <option value="">Todos</option>
              <option value={OrderStatus.Paid}>Pagado</option>
              <option value={OrderStatus.PendingPayment}>Pendiente</option>
              <option value={OrderStatus.Cancelled}>Cancelado</option>
              <option value={OrderStatus.Failed}>Fallido</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📋 Tabla (escritorio) */}
      <div className="overflow-x-auto">
        <div className="hidden md:block">
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 text-left"># Orden</th>
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Fecha</th>
                <th className="py-3 px-4 text-left">SubTotal</th>
                <th className="py-3 px-4 text-left">Iva</th>
                <th className="py-3 px-4 text-left">Retención</th>
                <th className="py-3 px-4 text-left">Total</th>
                <th className="py-3 px-4 text-left">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Loader2 className="animate-spin inline-block text-indigo-500 w-6 h-6 mr-2" />
                    Cargando órdenes...
                  </td>
                </tr>
              ) : data?.orders?.length ? (
                data.orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 px-4 font-semibold">{o.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 font-semibold">{o.client.firstName}</td>
                    <td className="py-3 px-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(o.subtotal)}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(o.iva)}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(o.retencion)}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={clsx(
                          "inline-block px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 text-center",
                          {
                            "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30":
                              o.status === OrderStatus.Paid,
                            "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30":
                              o.status === OrderStatus.PendingPayment,
                            "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30":
                              o.status === OrderStatus.Cancelled || o.status === OrderStatus.Failed,
                          }
                        )}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-3">
                        <Eye
                          className="cursor-pointer w-5 h-5 text-indigo-600 hover:scale-110 transition-transform dark:text-indigo-400"
                          onClick={() => onView(o.id)}
                        />
                        {o.status === OrderStatus.PendingPayment && (
                          <>
                            <CreditCard
                              className="cursor-pointer w-5 h-5 text-emerald-600 hover:scale-110 transition-transform dark:text-emerald-400"
                              onClick={() => handlePayOrder(o.id)}
                            />
                            <XCircle
                              className="cursor-pointer w-5 h-5 text-rose-600 hover:scale-110 transition-transform dark:text-rose-400"
                              onClick={() => handleCancelOrder(o.id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No tienes órdenes aún 🧾
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🧱 Vista móvil tipo tarjetas */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="animate-spin inline-block text-indigo-500 w-6 h-6 mr-2" />
              Cargando órdenes...
            </div>
          ) : data?.orders?.length ? (
            data.orders.map((o) => (
              <div
                key={o.id}
                className="p-4 bg-white/90 dark:bg-gray-900/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 m-2 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full font-medium border",
                      {
                        "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30":
                          o.status === OrderStatus.Paid,
                        "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30":
                          o.status === OrderStatus.PendingPayment,
                        "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30":
                          o.status === OrderStatus.Cancelled || o.status === OrderStatus.Failed,
                      }
                    )}
                  >
                    {o.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>📅 {new Date(o.createdAt).toLocaleDateString()}</p>
                  <p>💰 {formatCurrency(o.total)}</p>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <Eye
                    className="cursor-pointer w-5 h-5 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
                    onClick={() => onView(o.id)}
                  />
                  {o.status === OrderStatus.PendingPayment && (
                    <>
                      <CreditCard
                        className="cursor-pointer w-5 h-5 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                        onClick={() => handlePayOrder(o.id)}
                      />
                      <XCircle
                        className="cursor-pointer w-5 h-5 text-rose-600 dark:text-rose-400 hover:scale-110 transition-transform"
                        onClick={() => handleCancelOrder(o.id)}
                      />
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              No tienes órdenes aún 🧾
            </p>
          )}
        </div>
      </div>

      {/* 📄 Paginación */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 rounded-b-2xl">
        <Pagination
          totalItems={data?.ordersCount?.totalItems || 0}
          itemsPerPage={itemsPerPage}
          totalPages={Math.ceil(
            (data?.ordersCount?.totalItems || 0) / itemsPerPage
          )}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
