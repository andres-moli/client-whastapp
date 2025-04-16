import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { PresupuestoVsVenta, usePresupuestoVentaPorUsuarioQuery } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { formatCurrency } from "../../lib/utils";
import dayjs from "dayjs";
import { calcularDesempenoDiario } from "../../lib/porcentaMesActualAnterior";
import { Activity, ArrowDown, ArrowUp, BarChart2, CircleDollarSign, Minus, Percent, Target, TrendingDown, TrendingUp } from "lucide-react";

export default function MonthlyTarget() {
  const { user } = useUser()
  const {data, loading} = usePresupuestoVentaPorUsuarioQuery({
    variables: {
      userId: user?.id || ''
    }
  })
  const series = [data?.presupuestoVentaPorUsuario?.cumplimientoAcumuladoActual || 0];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show:true
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };
  const [isOpen, setIsOpen] = useState(false);


  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Progreso mensual
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Tu progreso mensual vas asi hasta ahora
            </p>
          </div>
          {/* <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div> */}
        </div>
        <div className="relative ">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          {/* <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            hoy +10%
          </span> */}
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {
            loading ? 
            <>Cargando...</> 
            : 
            <>
            <TarjetaDesempeno data={data?.presupuestoVentaPorUsuario} />
            </>
          }
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Presupuesto
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(data?.presupuestoVentaPorUsuario?.presupuestoActual || 0)}
            {
              (data?.presupuestoVentaPorUsuario?.presupuestoActual || 0) >= (data?.presupuestoVentaPorUsuario?.presupuestoAnterior || 0)
              ?
              <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                  fill="#039855"
                />
              </svg>
              </>
              :
              <>
              <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                  fill="#D92D20"
                />
              </svg>
              </>
            }
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Presupuesto anterior
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
          {formatCurrency(data?.presupuestoVentaPorUsuario?.presupuestoAnterior || 0)}
          {
              (data?.presupuestoVentaPorUsuario?.presupuestoActual || 0) <= (data?.presupuestoVentaPorUsuario?.presupuestoAnterior || 0)
              ?
              <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                  fill="#039855"
                />
              </svg>
              </>
              :
              <>
              <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                  fill="#D92D20"
                />
              </svg>
              </>
            }
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        {/* <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Dolar hoy
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            $20K
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div> */}
      </div>
    </div>
  );
}
function TarjetaDesempeno({ data }: { data: PresupuestoVsVenta | null | undefined }) {
  // Definición de estilos
  const colorStatus = {
    MEJOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    PEOR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    IGUAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const iconStatus = {
    MEJOR: <ArrowUp className="h-4 w-4" />,
    PEOR: <ArrowDown className="h-4 w-4" />,
    IGUAL: <Minus className="h-4 w-4" />
  };

  if (!data) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Formatear valores monetarios

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colorStatus[data.comparacionVentaHoy]}`}>
            {iconStatus[data.comparacionVentaHoy]}
            {data.comparacionVentaHoy === 'MEJOR' ? '↑ Hoy mejor' : 
             data.comparacionVentaHoy === 'PEOR' ? '↓ Hoy peor' : 
             '↔ Hoy igual'}
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colorStatus[data.comparacionVentaAcumulada]}`}>
            <Activity className="h-4 w-4" />
            {data.comparacionVentaAcumulada === 'MEJOR' ? '↑ Acumulado mejor' : 
             data.comparacionVentaAcumulada === 'PEOR' ? '↓ Acumulado peor' : 
             '↔ Acumulado igual'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 mt-4">
      {/* Cuadro 1: Ventas hoy */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <CircleDollarSign className="h-4 w-4" />
          Ventas hoy
        </div>
        <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
          {formatCurrency(data.ventaHoyActual)}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Mes anterior: {formatCurrency(data.ventaMismoDiaAnterior)}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 mt-4">
      {/* Cuadro 2: Ventas acumuladas mes actual */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <BarChart2 className="h-4 w-4" />
          Ventas acumuladas
        </div>
        <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
          {formatCurrency(data.ventaAcumuladaHastaHoy)}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Mes anterior: {formatCurrency(data.ventaAcumuladaHastaMismoDiaAnterior)}
        </p>
      </div>
    </div>

      {/* Pie de tarjeta */}
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Actualizado al día {data.diaActual} - Comparado con mismo día del mes anterior
        </p>
      </div>
    </div>
  );
}