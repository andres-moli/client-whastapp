import PageMeta from "../../../components/common/PageMeta";
import { OrdersTable } from "./components/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <PageMeta
        title="Ordenes"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Gestión de Órdenes y Pagos
      </h1>
        <div>
          <h2 className="text-lg font-semibold mb-3">Órdenes</h2>
          <OrdersTable />
        </div>
    </div>
  );
}
