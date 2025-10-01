import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FichaTable from "./tableProducts";

export default function ProductPage() {
  return (
    <div>
      <PageMeta
        title="Productos"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Productos" />
      <FichaTable />
    </div>
  );
}
