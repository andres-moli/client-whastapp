import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ClassTable from "./tableBasic";

export default function ClassPage() {
  return (
    <div>
      <PageMeta
        title="Clases"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Clases" />
      <ClassTable />
    </div>
  );
}
