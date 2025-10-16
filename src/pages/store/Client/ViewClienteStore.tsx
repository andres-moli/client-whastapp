import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import clsx from "clsx";
import {
  ClientKind,
  ClientStatus,
  ClientType,
  OrderStatus,
  OrderTypes,
  useOrdersQuery,
  UserDocumentTypes,
  useStoreClientQuery,
  useUpdateStoreClientMutation,
} from "../../../domain/graphql";
import { formatCurrency, ToastyErrorGraph } from "../../../lib/utils";
import { Pagination } from "../../../components/ui/table/pagination";
import PageMeta from "../../../components/common/PageMeta";
import Swal from "sweetalert2";
import { toast } from "sonner";

export const ViewClienteStore = () => {
  const { id } = useParams();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [updateClient] = useUpdateStoreClientMutation();
  const navigate = useNavigate();

  if (!id) return <>ID no encontrado</>;

  const { data, loading, refetch } = useStoreClientQuery({
    variables: { storeClientId: id },
  });

  const {
    data: dataOrdenes,
    loading: loadingOrdenes,
    error: errorOrdenes,
  } = useOrdersQuery({
    variables: {
      where: { client: { _eq: id } },
      pagination: { skip: currentPage, take: itemsPerPage },
      orderBy: { createdAt: OrderTypes.Desc },
    },
  });

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-indigo-500" />
        Cargando detalles del cliente...
      </div>
    );
  }

  const client = data?.storeClient;
  if (!client) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-gray-300">
        No se encontró el cliente.
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas actualizar?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear",
        cancelButtonText: "Cancelar",
      });
      if(result.dismiss) return
      const res = await updateClient({
        variables: {
          updateInput: { id: client.id, ...formData },
        },
      });
      if(res.errors){
        toast.error(res.errors[0].message)
        return
      }
      toast.success('Actualizado correctamente')
      refetch();
    } catch (err) {
      ToastyErrorGraph(err as any)
      console.error("Error al actualizar cliente:", err);
    } finally {
      setIsEditing(false);
    }
  };

  const onView = (id: string) => navigate(`/orders-detail/${id}`);

  return (
    <div className="max-w-6xl mx-auto p-5 sm:p-8">
      <PageMeta
        title={client ? client.firstName.toLocaleUpperCase() : 'Cargando...'}
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* 🧾 Datos del cliente */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Datos del cliente
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {isEditing ? "Cancelar" : "Editar"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-500">Nombre</label>
            <input
              name="firstName"
              value={formData.firstName ?? client.firstName ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800",
                isEditing ? "border-indigo-300" : "border-gray-300"
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">Apellido</label>
            <input
              name="lastName"
              value={formData.lastName ?? client.lastName ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800",
                isEditing ? "border-indigo-300" : "border-gray-300"
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">NIT</label>
            <input
              name="nit"
              value={formData.nit ?? client.nit ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">Email</label>
            <input
              name="email"
              value={formData.email ?? client.email ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">Teléfono</label>
            <input
              name="phone"
              value={formData.phone ?? client.phone ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Tipo de documento</label>
            <select
              name="identificationType"
              value={formData.identificationType ?? client.identificationType ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            >
              <option value={""} disabled>Selecione una opción</option>
              <option value={UserDocumentTypes.Nit}>Nit</option>
              <option value={UserDocumentTypes.CitizenshipCard}>Cedula de ciudadania</option>
              <option value={UserDocumentTypes.Passport}>Pasaporte</option>
              <option value={UserDocumentTypes.SpecialPermissionToStay}>Permiso de permanecia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Tipo de cliente</label>
            <select
              name="clientType"
              value={formData.clientType ?? client.clientType ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            >
              <option value={ClientType.A}>A</option>
              <option value={ClientType.Aa}>AA</option>
              <option value={ClientType.Aaa}>AAA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-500">Tipo de persona</label>
            <select
              name="clientKind"
              value={formData.clientKind ?? client.clientKind ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            >
              <option value={ClientKind.Normal}>Persona</option>
              <option value={ClientKind.Company}>Empresa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Estado</label>
            <select
              name="status"
              value={formData.status ?? client.status ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300"
            >
              <option value={ClientStatus.Active}>Activo</option>
              <option value={ClientStatus.Inactive}>Inactivo</option>
              <option value={ClientStatus.Pending}>Pendiente</option>
              <option value={ClientStatus.Suspended}>Suspendida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Fecha de creación</label>
            <input
              value={new Date(client.createdAt).toLocaleDateString()}
              disabled
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300 bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Fecha de actualización</label>
            <input
              value={new Date(client.updatedAt).toLocaleDateString()}
              disabled
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300 bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Email Verificado</label>
            <input
              value={client.isVerifiedEmail ? "Sí" : "No"}
              disabled
              className="mt-1 w-full px-3 py-2 rounded-md border dark:bg-gray-800 border-gray-300 bg-gray-100 dark:bg-gray-800"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </div>

      {/* 📋 Órdenes del cliente */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Órdenes del cliente
        </h2>

        {loadingOrdenes ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin inline-block w-5 h-5 mr-2 text-indigo-500" />
            Cargando órdenes...
          </div>
        ) : errorOrdenes ? (
          <p className="text-red-500">Error al cargar órdenes</p>
        ) : dataOrdenes?.orders?.length ? (
          <>
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
                    {dataOrdenes.orders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-3 px-4 font-semibold">{o.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 font-semibold">{o.client.firstName}</td>
                        <td className="py-3 px-4">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(o.subtotal)}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(o.iva)}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(o.retencion)}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(o.total)}
                        </td>
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
                                  o.status === OrderStatus.Cancelled ||
                                  o.status === OrderStatus.Failed,
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 🧱 Vista móvil */}
              <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                {dataOrdenes.orders.map((o) => (
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
                              o.status === OrderStatus.Cancelled ||
                              o.status === OrderStatus.Failed,
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📄 Paginación */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 rounded-b-2xl">
              <Pagination
                totalItems={dataOrdenes?.ordersCount?.totalItems || 0}
                itemsPerPage={itemsPerPage}
                totalPages={Math.ceil(
                  (dataOrdenes?.ordersCount?.totalItems || 0) / itemsPerPage
                )}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            No hay órdenes registradas para este cliente.
          </p>
        )}
      </div>
    </div>
  );
};
