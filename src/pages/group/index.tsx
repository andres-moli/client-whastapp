import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GroupTable from "./tableGroup";

export default function GroupPage() {
  return (
    <div>
      <PageMeta
        title="Grupos"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Grupo de contacto" />
      <GroupTable />
    </div>
  );
}
