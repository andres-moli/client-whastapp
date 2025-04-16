import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useUser } from "../../context/UserContext";
import { PackagePlus, Users, Smartphone } from "lucide-react";
import Chart from "react-apexcharts";
import { useMemo } from "react";

export default function Home() {
  const { user } = useUser();

  const barOptions = useMemo(() => ({
    chart: {
      id: "mensajes-enviados",
      toolbar: { show: false },
    },
    xaxis: {
      categories: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    },
    colors: ["#6366F1"],
    dataLabels: { enabled: false },
    theme: { mode: "light" },
  }), []);

  const barSeries = useMemo(() => [
    {
      name: "Mensajes enviados",
      data: [120, 150, 80, 200, 170, 90, 100],
    },
  ], []);

  const radialOptions = useMemo(() => ({
    chart: {
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "22px",
            fontWeight: "bold",
          },
        },
      },
    },
    colors: ["#10B981"],
    labels: ["Uso de números"],
  }), []);

  const radialSeries = useMemo(() => [76], []); // 76% de uso

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="Sistema de envío masivo de WhatsApp - Panel de control"
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          ¡Hola, {user?.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido al panel de administración.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Crear Lote */}
        <Link
          to="/bundles"
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400 p-3 rounded-xl">
              <PackagePlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:underline">
                Ver Lote
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agrupa tus envíos en lotes personalizados.
              </p>
            </div>
          </div>
        </Link>

        {/* Crear Grupo */}
        <Link
          to="/group-create/"
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:underline">
                Crear Grupo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organiza contactos por grupos de envío.
              </p>
            </div>
          </div>
        </Link>

        {/* Celulares */}
        <Link
          to="/cells"
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 p-3 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:underline">
                Celulares
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administra tus contactos y números.
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Mensajes enviados esta semana
          </h2>
          <Chart 
          //@ts-ignore
          options={barOptions} series={barSeries} type="bar" height={300} />
        </div>

        {/* Gráfico Radial */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Uso de líneas activas
          </h2>
          <Chart 
          //@ts-ignore
          options={radialOptions} series={radialSeries} type="radialBar"  height={300} />
        </div>
      </div>
    </>
  );
}
