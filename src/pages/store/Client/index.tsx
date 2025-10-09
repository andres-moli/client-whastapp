import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ClientStoreTable from "./TableStoreClient";

export default function ClienteStorePage() {
  return (
    <div>
      <PageMeta
        title="Clientes Tienda"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Clientes en tiendas" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <ClientStoreTable />
      </div>
    </div>
  );
}
