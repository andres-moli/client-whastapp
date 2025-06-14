import { useState, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { set, z } from "zod";

import { Modal } from "../../components/ui/modal";
import { ToastyErrorGraph } from "../../lib/utils";
import { useUpdateCellMutation, CellStatusEmun, WsCell, useCitiesQuery, useUsersQuery, TypeClientEnum, useGroupsQuery, CellTpeStatusEmun, useClassesQuery } from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import SearchableSelect, { Option } from "../../components/form/selectSeach";
import SearchableMultiSelect from "../../components/form/SearchableMultiSelect";
import Checkbox from "../../components/form/input/Checkbox";

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
const typeOption: Option[] = [
  { value: CellTpeStatusEmun.Cliente, label: "Cliente" },
  { value: CellTpeStatusEmun.Proveedor, label: "Proveedor" }
];
const cellSchema = z.object({
  celular: z.string().min(1, "El celular es obligatorio"),
  region: z.string().min(1, "La región es obligatoria"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  email: z.string().optional(),
  status: z.nativeEnum(CellStatusEmun)
});

interface UpdateCellModalProps {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
  cell: WsCell | undefined
}

export const UpdateCellModal: React.FC<UpdateCellModalProps> = ({ isOpen, closeModal, openModal, cell }) => {
  if(cell == undefined) return null;
  const [updateCell] = useUpdateCellMutation();
  const {data: dataCity, loading: loadingCity} = useCitiesQuery({})
  const {data: dataUsers, loading: loadingUser} = useUsersQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 9999999
      }
    }
  })
  const {data: dataGrupo, loading: loadingGrupo} = useGroupsQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 9999999
      }
    }
  })
  const {data: dataCllass, loading: loagindCllas} = useClassesQuery({
    variables: {
      pagination: {
        skip: 0,
        take: 9999999
      }
    }
  })
  // Prellenar los estados
  const [celular, setCelular] = useState(cell.celular);
  const [region, setRegion] = useState(cell.region);
  const [nit, setNit] = useState(cell.nit);
  const [nombre, setNombre] = useState(cell.nombre ?? "");
  const [apellido, setApellido] = useState(cell.apellido ?? "");
  const [direccion, setDireccion] = useState(cell.direccion ?? "");
  const [email, setEmail] = useState(cell.email ?? "");
  const [status, setStatus] = useState<CellStatusEmun>(cell.status);
  const [cityId, setCityId] = useState(cell.city?.id ?? ""); 
  const [asistendId, setAsistentedId] = useState(cell.asistente?.id ?? "");
  const [asesorId, setAsesorId] = useState(cell.asesor?.id ?? "");
  const [empresa, setEmpresa] = useState(cell.empresa ?? "");
  const [tipoCliente, setTipoCliente] = useState<TypeClientEnum | undefined>(cell.tipoCliente || undefined);
  const [groupIds, setGroups] = useState<string[]>(cell.wsGroupCells?.map(wsgc => wsgc.group.id) || []);
  const [classIds, setClassIds] = useState<string[]>(cell.cellClasses?.map(wccl => wccl.class.id) || []);
  const [isChecked, setIsChecked] = useState(cell.verify || false);
  const [type, setType] = useState<CellTpeStatusEmun>(()=> cell.type || CellTpeStatusEmun.Cliente);
  const [extraEmails, setExtraEmails] = useState<string[]>(cell.emails?.map((cell) => cell.address) || []);
  const [newExtraEmail, setNewExtraEmail] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  useEffect(() => {
    if (isOpen) {
      setCelular(cell.celular);
      setRegion(cell.region);
      setNit(cell.nit);
      setNombre(cell.nombre ?? "");
      setDireccion(cell.direccion ?? "");
      setEmail(cell.email ?? "");
      setStatus(cell.status);
      setCityId(cell.city?.id ?? "");
      setAsistentedId(cell.asistente?.id ?? "");
      setAsesorId(cell.asesor?.id ?? "");
      setEmpresa(cell.empresa ?? "");
      setTipoCliente(cell.tipoCliente ?? undefined);
      setApellido(cell.apellido ?? "");
      setIsChecked(cell.verify || false)
      setType(cell.type || CellTpeStatusEmun.Cliente)
      setGroups(cell.wsGroupCells?.map(wsgc => wsgc.group.id) || [])
      setClassIds(cell.cellClasses?.map(wccl => wccl.class.id) || [])
      setExtraEmails(cell.emails?.map((cell) => cell.address) || [])
    }
  }, [isOpen, cell]);

  const handleUpdate = async () => {
    const invalidEmails = extraEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      toast.error(`Correos inválidos: ${invalidEmails.join(", ")}`);
      return;
    }
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
        title: "¿Actualizar celular?",
        text: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar"
      });

      if (confirm.dismiss) {
        openModal();
        return;
      }

      if (confirm.isConfirmed) {
        const res = await updateCell({
          variables: {
            updateInput: {
              id: cell.id,
              celular,
              region,
              nit,
              nombre,
              direccion,
              email,
              status,
              apellido,
              verify: isChecked,
              ciudad: cityId || undefined,
              asesorId: asesorId || undefined,
              asistenteId: asistendId || undefined,
              empresa: empresa || undefined,
              tipoCliente: tipoCliente || undefined,
              groupIds,
              type,
              classIds,
              emailsDto: extraEmails
            }
          }
        });

        if (res.errors) {
          toast.error("Error al actualizar: " + res.errors[0].message);
          return;
        }

        apolloClient.cache.evict({ fieldName: "Cells" });
        toast.success("Celular actualizado correctamente");
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
  const classOption: Option[] = dataCllass?.Classes?.map((cla) => {
    return {
      value: cla.id,
      label: cla.name.toUpperCase().trim()
    }
  }).sort((a,b) => a.label.localeCompare(b.label)) || []
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-9xl p-6 lg:p-10">
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">Actualizar Celular</h5>

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
                value={nit || ''}
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
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Correo electrónico
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
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
              defaultValue={tipoCliente}
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
                defaultValue={asistendId}
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
                defaultValue={asesorId}
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
              defaultValue={groupIds}
            />
          }
        </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <SearchableSelect
              options={typeOption}
              placeholder="Selecciona un tipo"
              onChange={(value) => setType(value as CellTpeStatusEmun)}
              defaultValue={type}
            />
          </div>
          {
            type === CellTpeStatusEmun.Proveedor && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecione clases
              </label>
              {
                loagindCllas 
                ? 
                <>Cargando clases</>
                :
                <SearchableMultiSelect
                  placeholder="Seleccione uno o varias clases"
                  options={classOption}
                  onChange={setClassIds}
                  defaultValue={classIds}
                />
              }
            </div>
            ) 
          }
        <div className="mt-3">
        <div className="flex items-center gap-3">
          <Checkbox checked={isChecked} onChange={setIsChecked} />
          <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
            Verificado
          </span>
        </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Correos adicionales
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="email"
              placeholder="Agregar correo adicional"
              value={newExtraEmail}
              onChange={(e) => setNewExtraEmail(e.target.value)}
              className="dark:bg-dark-900 flex-1 h-11 appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            <button
              type="button"
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-md text-sm"
              onClick={() => {
                if (newExtraEmail && !extraEmails.includes(newExtraEmail)) {
                  setExtraEmails([...extraEmails, newExtraEmail]);
                  setNewExtraEmail("");
                }
              }}
            >
              Agregar
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {extraEmails.map((email, index) => (
              <li key={index} className="flex items-center justify-between text-sm text-gray-800 dark:text-white/90 bg-gray-100 dark:bg-dark-800 px-3 py-1 rounded-md">
                <span>{email}</span>
                <button
                  onClick={() => setExtraEmails(extraEmails.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
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
            onClick={handleUpdate}
            type="button"
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {"Actualizar Celular"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
