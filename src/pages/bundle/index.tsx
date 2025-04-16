import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BundleTable from "./tableBundle";

export default function BundlePage() {
  return (
    <div>
      <PageMeta
        title="Lotes"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Lotes" />
      <BundleTable />
    </div>
  );
}
