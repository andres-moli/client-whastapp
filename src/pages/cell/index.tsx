import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { TableCell } from "../../components/ui/table";
import CellTable from "./tableCell";

export default function CellPage() {
  return (
    <div>
      <PageMeta
        title="Celulares"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Celulares" />
      <CellTable />
    </div>
  );
}
