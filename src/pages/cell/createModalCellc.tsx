import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

import { Modal } from "../../components/ui/modal";
import { ToastyErrorGraph } from "../../lib/utils";
import { useCreateCellMutation, CellStatusEmun, useCitiesQuery, useUsersQuery, TypeClientEnum, useGroupsQuery } from "../../domain/graphql";
import { useUser } from "../../context/UserContext";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import SearchableMultiSelect from "../../components/form/SearchableMultiSelect";
import EmailInputWithSuggestions from "../../components/form/input/EmailInputWithSuggestions";

// Enum de estado para options
const statusOptions: Option[] = [
  { value: CellStatusEmun.Activo, label: "Activo" },
  { value: CellStatusEmun.Inactivo, label: "Inactivo" }
];
const clientIption: Option[] = [
  { value: TypeClientEnum.ClienteFinal, label: "CLIENTE FINAL" },
  // { value: TypeClientEnum.Distribuidor, label: "DISTRIBUIDOR" },
  // { value: TypeClientEnum.Instalador, label: "INSTALADOR" },
  { value: TypeClientEnum.Integrador, label: "INTEGRADOR" },
];
// Validación Zod
const cellSchema = z.object({
  celular: z.string().min(1, "El celular es obligatorio"),
  region: z.string().min(1, "La región es obligatoria"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  email: z.string().optional(),
  status: z.nativeEnum(CellStatusEmun)
});

interface CreateCellModalProps {
  closeModal: () => void;
  openModal: () => void;
  isOpen: boolean;
}

export const CreateCellModal: React.FC<CreateCellModalProps> = ({ isOpen, closeModal, openModal }) => {
  const { user } = useUser();
  const [createCell] = useCreateCellMutation();
  const {data: dataCity, loading: loadingCity} = useCitiesQuery({})
  const {data: dataGrupo, loading: loadingGrupo} = useGroupsQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 9999999
      }
    }
  })
  const {data: dataUsers, loading: loadingUser} = useUsersQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 9999999
      }
    }
  })

  // Estados
  const [celular, setCelular] = useState("");
  const [region, setRegion] = useState("57");
  const [nit, setNit] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [status, setStatus] = useState<CellStatusEmun>(CellStatusEmun.Activo);
  const [tipoCliente, setTipoCliente] = useState<TypeClientEnum>();
  const [cityId, setCityId] = useState("");
  const [asistendId, setAsistentedId] = useState("");
  const [asesorId, setAsesorId] = useState("");
  const [groupIds, setGroups] = useState<string[]>([]);

  const handleCreate = async () => {
    const validation = cellSchema.safeParse({
      celular,
      region,
      nit,
      nombre,
      direccion,
      email,
      status
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      closeModal();
      const confirm = await Swal.fire({
        title: "¿Crear celular?",
        text: "¿Estás seguro de registrar este número?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear",
        cancelButtonText: "Cancelar"
      });

      if (confirm.dismiss) {
        openModal();
        return;
      }

      if (confirm.isConfirmed) {
        const res = await createCell({
          variables: {
            createInput: {
              celular,
              region,
              nit,
              nombre,
              direccion,
              email,
              status,
              apellido,
              ciudad: cityId || undefined,
              asesorId: asesorId || undefined,
              asistenteId: asistendId || undefined,
              empresa: empresa || undefined,
              tipoCliente: tipoCliente || undefined,
              groupIds: groupIds,
            }
          }
        });

        if (res.errors) {
          toast.error("Error al crear: " + res.errors[0].message);
          return;
        }

        apolloClient.cache.evict({ fieldName: "Cells" });
        toast.success("Celular creado exitosamente");
      }
    } catch (err) {
      openModal();
      ToastyErrorGraph(err as any);
    }
  };
  const cityOptions: Option[] = dataCity?.cities.map((city) => {
    return {
      value: city.id,
      label: city.name
    }
  }).sort((a,b) => a.label.localeCompare(b.label)) || []
  const userOptions: Option[] = dataUsers?.users?.map((city) => {
    return {
      value: city.id,
      label: city.fullName.toUpperCase() + ' - ' + city.identificationNumber
    }
  }).sort((a,b) => a.label.localeCompare(b.label)) || []
  const grupoOptions: Option[] = dataGrupo?.groups?.map((city) => {
    return {
      value: city.id,
      label: city.nombre.toUpperCase().trim()
    }
  }).sort((a,b) => a.label.localeCompare(b.label)) || []
  useEffect(() => {
    if (!loadingCity && cityOptions.length) {
      console.log(cityOptions)
      const barranquilla = cityOptions.find(c => c.label.toUpperCase().trim() === "BARRANQUILLA");
      if (barranquilla) {
        setCityId(barranquilla.value);
      }
    }
  }, [loadingCity, cityOptions]);
  
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-9xl p-6 lg:p-10">
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">Crear Celular</h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Celular
            </label>
            <div className="relative">
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nit
            </label>
            <div className="relative">
              <input
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Apellido
            </label>
            <div className="relative">
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Dirección
            </label>
            <div className="relative">
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <EmailInputWithSuggestions 
                onChange={setEmail}
                value={email}
                label="Correo electrónico"
                placeholder="example@gmail.com"
              />
          <div className="mt-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Empresa
            </label>
            <div className="relative">
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de cliente
            </label>
            <SearchableSelect
              options={clientIption}
              placeholder="Selecciona un tipo de cliente"
              onChange={(value) => setTipoCliente(value as TypeClientEnum)}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <SearchableSelect
              options={statusOptions}
              placeholder="Selecciona el estado"
              onChange={(value) => setStatus(value as CellStatusEmun)}
              defaultValue={status}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ciudad
            </label>
            {
              loadingCity 
              ? 
              <>Cargando ciudades</>
              :
              <SearchableSelect
                placeholder="Seleccione una ciudad"
                options={cityOptions}
                onChange={setCityId}
                defaultValue={cityId}
              />
            }
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Asistente
            </label>
            {
              loadingUser 
              ? 
              <>Cargando asistente</>
              :
              <SearchableSelect
                placeholder="Seleccione un asistente"
                options={userOptions}
                onChange={setAsistentedId}
              />
            }
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Asesor
            </label>
            {
              loadingUser 
              ? 
              <>Cargando asesor</>
              :
              <SearchableSelect
                placeholder="Seleccione una asesor"
                options={userOptions}
                onChange={setAsesorId}
              />
            }
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecione grupo
          </label>
          {
            loadingGrupo 
            ? 
            <>Cargando grupos</>
            :
            <SearchableMultiSelect
              placeholder="Seleccione uno o varios grupos"
              options={grupoOptions}
              onChange={setGroups}
            />
          }
        </div>

        {/* Botones del modal */}
        <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Cerrar
          </button>
          <button
            onClick={handleCreate}
            type="button"
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {"Crear Celular"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
