import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FichaTable from "./tableFicha";

export default function FichaPage() {
  return (
    <div>
      <PageMeta
        title="Fichas Tecnicas"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Fichas Tecnicas" />
      <FichaTable />
    </div>
  );
}
