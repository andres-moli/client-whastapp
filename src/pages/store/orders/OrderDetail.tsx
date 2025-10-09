import { useParams, useNavigate } from "react-router";
import { useQuery, gql } from "@apollo/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import clsx from "clsx";
import { ClientKind, OrderStatus, useFindAllPaymentQuery, useOderAdminQuery, useOrderQuery } from "../../../domain/graphql";
import { formatCurrency } from "../../../lib/utils";
import PageMeta from "../../../components/common/PageMeta";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-gray-300">
        <p className="mb-4 text-lg">No se pudo cargar la orden 😕</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
        >
          Volver
        </button>
      </div>
    );
  }
  const { data, loading } = useOderAdminQuery({
    variables: { orderId: id },
  });
  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
  } = useFindAllPaymentQuery({
    variables: { orderId: id },
  });
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-indigo-500" />
        Cargando detalles de la orden...
      </div>
    );
  }

  if (!data?.oderAdmin) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-gray-300">
        <p className="mb-4 text-lg">No se pudo cargar la orden 😕</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
        >
          Volver
        </button>
      </div>
    );
  }

  const order = data.oderAdmin;
  return (
    <div className="max-w-5xl mx-auto p-5 sm:p-8">
      <PageMeta
        title={`Orden ${order ? order.id.slice(0,8) : 'Cargando...'}`}
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* 🔙 Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Orden #{order.id.slice(0, 8)}
        </h1>
      </div>

      {/* 🧾 Info general */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fecha de creación:
            </p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estado:</p>
            <span
                className={clsx(
                "inline-block px-3 py-1.5 rounded-full text-xs font-semibold border text-center transition-all duration-200",
                {
                    // ✅ Pagado
                    "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30":
                    order.status === OrderStatus.Paid,

                    // 🕓 Pendiente
                    "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30":
                    order.status === OrderStatus.PendingPayment,

                    // ❌ Cancelado o fallido
                    "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30":
                    [OrderStatus.Cancelled, OrderStatus.Failed].includes(order.status),

                    // ⚪ Por defecto (otros estados desconocidos)
                    "text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-800/50":
                    ![
                        OrderStatus.Paid,
                        OrderStatus.PendingPayment,
                        OrderStatus.Cancelled,
                        OrderStatus.Failed,
                    ].includes(order.status),
                }
            )}

            >
              {order.status.replace("_", " ")}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sub total:</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {formatCurrency(order.subtotal)}
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* IVA */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">IVA (19%):</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {formatCurrency(order.iva)}
            </p>
          </div>

          {/* Retención */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Retención (2.5%):</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {formatCurrency(order.retencion)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total:</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

      </div>
      {/* CLIENTE */}
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Detalles del cliente
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <span className="font-semibold">Nombre:</span>{" "}
            {order.client.firstName|| "—"}
          </div>
          <div>
            <span className="font-semibold">Documento:</span>{" "}
            {order.client.nit + ' - '+  (order.client.clientKind == ClientKind.Normal ? 'PERSONA' : 'EMPRESA') || "—"}
          </div>
          <div>
            <span className="font-semibold">Email:</span>{" "}
            {order.client.email || "—"}
          </div>
          <div>
            <span className="font-semibold">Celular:</span>{" "}
            {order.client.phone|| "—"}
          </div>
          <div>
            <span className="font-semibold">Tipo:</span>{" "}
            {order.client.clientType || "—"}
          </div>
        </div>
      </div>
      {/* 🧩 Productos */}
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-5 sm:p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Productos
        </h2>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-4">
                {item.product?.file?.url ? (
                  <img
                    src={item.product.file.url}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                    N/A
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {item.product.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-end w-full sm:w-auto">
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 💳 Pago */}
      {order.payment && (
        <>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Detalles del pago
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <span className="font-semibold">Proveedor:</span>{" "}
              {order.payment.provider || "—"}
            </div>
            <div>
              <span className="font-semibold">Transacción:</span>{" "}
              {order.payment.transactionId || "—"}
            </div>
            <div>
              <span className="font-semibold">Método:</span>{" "}
              {order.payment.paymentMethod || "—"}
            </div>
            <div>
              <span className="font-semibold">Monto:</span>{" "}
              {formatCurrency(order.payment.amount)}
            </div>
            <div>
              <span className="font-semibold">Cliente:</span>{" "}
              {order.payment.customerName || "—"}
            </div>
            <div>
              <span className="font-semibold">Correo:</span>{" "}
              {order.payment.customerEmail || "—"}
            </div>
            <div>
              <span className="font-semibold">Estado:</span>{" "}
              <span
                className={clsx(
                  "inline-block px-2 py-0.5 rounded-full text-xs font-semibold border",
                  {
                    "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30":
                      order.payment.status === "Paid" ||
                      order.payment.status === "APPROVED",
                    "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30":
                      order.payment.status === "PENDING",
                    "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30":
                      order.payment.status === "FAILED" ||
                      order.payment.status === "CANCELLED",
                  }
                )}
              >
                {order.payment.status}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Detalles del envio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <span className="font-semibold">Dirreción:</span>{" "}
              {order.payment.addressLine1 || "—"}
            </div>
            <div>
              <span className="font-semibold">Ciudad:</span>{" "}
              {order.payment.city || "—"}
            </div>
            <div>
              <span className="font-semibold">Departamento:</span>{" "}
              {order.payment.state || "—"}
            </div>
            <div>
              <span className="font-semibold">Codigo postal:</span>{" "}
              {order.payment.postalCode || "—"}
            </div>
            <div>
              <span className="font-semibold">Celular:</span>{" "}
              {order.payment.customerPhone || "—"}
            </div>
          </div>
        </div>
        </>
      )}
        {/* 🧾 Historial de pagos */}
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Historial de pagos
        </h2>

        {paymentsLoading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin inline-block w-5 h-5 mr-2 text-indigo-500" />
            Cargando pagos...
          </div>
        ) : paymentsError ? (
          <p className="text-sm text-red-500">
            No se pudieron cargar los pagos.
          </p>
        ) : paymentsData?.findAllPayment?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Transacción</th>
                  <th className="px-4 py-3 text-end">Monto</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paymentsData.findAllPayment.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition"
                  >
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3">{p.transactionId}</td>
                    <td className="px-4 py-3 text-end font-semibold">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={clsx(
                          "inline-block px-3 py-1 rounded-full text-xs font-semibold border",
                          {
                            "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30":
                              ["APPROVED", "Paid"].includes(p.status),
                            "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30":
                              p.status === "PENDING",
                            "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30":
                              ["FAILED", "CANCELLED"].includes(p.status),
                          }
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No hay pagos registrados para esta orden.
          </p>
        )}
      </div>
    </div>
  );
}
