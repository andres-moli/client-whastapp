import React, { useEffect, useState } from "react";
import { useQuery, gql, ApolloClient } from "@apollo/client";
import axios from "axios";
import { z } from "zod";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { apolloClient } from "../../main.config";
import { ClientType, CreatePriceRuleInput, SubClass, useCreateProductMutation, useDeleteFileMutation, useSubClassesQuery } from "../../domain/graphql";
import handleUploadImage from "../../lib/uptloadFile";
import { formatCurrency } from "../../lib/utils";
import { Import } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";

// Schema de validación
const productSchema = z.object({
  reference: z.string().min(1, "La referencia es requerida"),
  title: z.string().min(1, "El título es requerido"),
  description: z.string(),
  basePrice: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  active: z.boolean(),
  fileIds: z.array(z.string()),
  mainPhoto: z.string(),
  rulePrice: z
    .array(
      z.object({ clientType: z.string().min(1), percentage: z.number().min(0) })
    ),
  subclassIds: z.array(z.string()),
});
interface RespuestaApi {
  referencia: string;
  Descripcion: string;
  Stock: number;
  Costo: number;
}
type RulePrice = { clientType: string; percentage: number };
const CLIENT_TYPES = ClientType ? Object.values(ClientType) : [];
export default function CreateProduct() {
  // Campos del formulario
  const [reference, setReference] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>("");
  const [active, setActive] = useState<boolean>(true);

  // Fotos y archivos
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [fileInfos, setFileInfos] = useState<Record<string, any>>({});

  // rulePrice array editable
  const [rulePrice, setRulePrice] = useState<RulePrice[]>([
    { clientType: "A", percentage: 20 },
  ]);
  const [availableClientTypes, setAvailableClientTypes] = useState<string[]>(CLIENT_TYPES);
  const [selectedClientTypes, setSelectedClientTypes] = useState<string[]>([]);
  // Subclases (selector con búsqueda)
  const [searchText, setSearchText] = useState("");
  const [selectedSubclasses, setSelectedSubclasses] = useState<SubClass[]>([]);
  const { data, loading, error, refetch } = useSubClassesQuery({
    variables: { where: { name: { _contains: searchText } }, pagination: { skip: 0, take: 20 } },
  });
 const [respuesta, setRespuesta] = useState<RespuestaApi | null>(null);

  const fetchReferencia = async () => {
    if (!reference.trim()) return;
    setRespuesta(null);
    const referencaEncode = encodeURI(reference)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_MICRO_GRAPH}ventas/referencia/tienda/${referencaEncode}`
      );

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const text = await res.text();
      if (!text) {
        toast.info('No se encontro esta referencia en el fomplus')
        setBasePrice(0)
        setTitle('')
        setRespuesta(null);
        return;
      }

      const data: RespuestaApi = JSON.parse(text);
      setBasePrice(data?.Costo ?? 0)
      setTitle(data?.Descripcion ?? '')
      setRespuesta(data);
      
    } catch (err) {
      console.error("Error al consultar la API:", err);
    }
  };

  // 3️⃣ Detectar la tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchReferencia();
    }
  };
  //MUTATIONS
  const [deleteFile] = useDeleteFileMutation();
  const [createProduct] = useCreateProductMutation();
  useEffect(() => {
    // Refrescar cuando cambie searchText
    const t = setTimeout(() => refetch(), 300);
    return () => clearTimeout(t);
  }, [searchText, refetch]);

  // Manejo de imágenes (simulamos upload retornando un id)
  const handleAddFiles = async (files: FileList | null) => {
    if (!files) return;
    // ejemplo simple: subir cada file a /api/files (multipart)
    const uploadedIds: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const dataFile = await handleUploadImage(f);
        if (dataFile) {
            uploadedIds.push(dataFile.id);
            setFileInfos((prev) => ({ ...prev, [dataFile.id]: dataFile }) );
        }
      } catch (err) {
        console.error("Upload error", err);
        toast.error("Error subiendo imagen: " + f.name);
      }
    }
    setFileIds((prev) => [...prev, ...uploadedIds]);
    // si no hay mainPhoto, pon la primera subida
    if (!mainPhoto && uploadedIds[0]) setMainPhoto(uploadedIds[0]);
  };

  const handleRemoveFile = (id: string) => {
    Swal.fire({
      title: "Eliminar foto",
      text: "¿Estás seguro de eliminar esta foto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteFile({ variables: { deleteFileId: id } });
        setFileIds((prev) => prev.filter((x) => x !== id));
        setFileInfos((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        if (mainPhoto === id) setMainPhoto(null);
        toast.success("Foto eliminada");
      }
    });
  };

  const handleSetMainPhoto = (id: string) => {
    setMainPhoto(id);
    toast.success("Foto principal establecida");
  };

  // rulePrice handlers
  const addRule = () => setRulePrice((p) => [...p, { clientType: "", percentage: 0 }]);
  const updateRule = (index: number, rule: Partial<RulePrice>) =>
    setRulePrice((p) => p.map((r, i) => (i === index ? { ...r, ...rule } : r)));
  const removeRule = (index: number) => {
    setRulePrice((p) => p.filter((_, i) => i !== index));
    const removedType = rulePrice[index]?.clientType;
    if (removedType) {
        setSelectedClientTypes((prev) => prev.filter((t) => t !== removedType));
        setAvailableClientTypes((prev) => [...prev, removedType]);
    }
    };
    const handleSelectClientType = (type: string) => {
        setSelectedClientTypes((prev) => [...prev, type]);
        setAvailableClientTypes((prev) => prev.filter((t) => t !== type));
    };


    const handleRemoveClientType = (type: string) => {
        setSelectedClientTypes((prev) => prev.filter((t) => t !== type));
        setAvailableClientTypes((prev) => [...prev, type]);
    };
  // Subclass selection
    const toggleSubclass = (subclass: SubClass) => {
        setSelectedSubclasses((prev) =>
        prev.find((s) => s.id === subclass.id)
        ? prev.filter((s) => s.id !== subclass.id)
        : [...prev, subclass]
        );
        setSearchText("");
        };
  const handleSubmit = async () => {
    // Validar con zod
    if(mainPhoto && !fileIds.includes(mainPhoto)) {
        toast.error("La foto principal debe estar entre las fotos subidas");
        return;
    }
    if(rulePrice.length === 0) {
        toast.error("Debe haber al menos una regla de precio");
        return;
    }
    if(rulePrice.some(r => !r.clientType)) {
        toast.error("Todas las reglas de precio deben tener un tipo de cliente");
        return;
    }
    if(new Set(rulePrice.map(r => r.clientType)).size !== rulePrice.length) {
        toast.error("Los tipos de cliente en las reglas de precio deben ser únicos");
        return;
    }
    if(selectedSubclasses.length === 0) {
        toast.error("Debe haber al menos una subclase seleccionada");
        return;
    }
    if (typeof basePrice === "string" && basePrice.trim() === "") {
      toast.error("El precio base es requerido");
      return;
    }
    
    const subclassIds = selectedSubclasses.map((s) => s.id);
    const parsed = productSchema.safeParse({
      reference,
      title,
      description,
      basePrice: typeof basePrice === "string" ? Number(basePrice || 0) : basePrice,
      active,
      fileIds,
      mainPhoto,
      rulePrice,
      subclassIds: subclassIds,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: "Crear producto",
        text: "¿Deseas crear este producto?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear",
      });
      if (!confirm.isConfirmed) return;
      const createRule: CreatePriceRuleInput[] = parsed.data.rulePrice.map(r => ({ clientType: (r.clientType as ClientType), percentage: r.percentage }));
      const res = await createProduct({ variables: { createInput: {
        ...parsed.data,
        rulePrice: createRule,
      } } });
      if(!res.data?.createProduct) {
        toast.error("Error creando el producto");
        return;
      }
      if(res.errors && res.errors.length > 0) {
        toast.error(res.errors[0].message);
        return;
      }
      // invalidar caches si es necesario
      if (apolloClient) {
        try {
          apolloClient.cache.evict({ fieldName: "Products" });
        } catch (e) {
          // no crítico
        }
      }

      toast.success("Producto creado con éxito");

      // limpiar
      setReference("");
      setTitle("");
      setDescription("");
      setBasePrice("");
      setActive(true);
      setFileIds([]);
      setMainPhoto(null);
      setRulePrice([{ clientType: "A", percentage: 20 }]);
      setSelectedSubclasses([]);
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al crear el producto");
    }
  };

  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <PageMeta description="hola" title="Productos crear"/>
      <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">Crear producto</h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: basic info */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Referencia</label>
          <input
            value={reference}
            onKeyDown={handleKeyDown}
            onChange={(e) => setReference(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1 dark:text-white/90 ">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1 dark:text-white/90 ">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400"
          />

          <div className="flex gap-4 mt-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Precio base ({formatCurrency(Number(basePrice))})</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Stock</label>
              <input
                type="number"
                value={respuesta?.Stock ?? 0}
                disabled={true}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Activo</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActive(true)}
                  className={`px-3 py-2 rounded-lg border ${active ? "bg-brand-500 text-white" : "bg-white"}`}>
                  Sí
                </button>
                <button
                  onClick={() => setActive(false)}
                  className={`px-3 py-2 rounded-lg border ${!active ? "bg-red-500 text-white" : "bg-white"}`}>
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Rule Price editor */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium dark:text-white/90 ">Reglas de precio</h4>
              <button onClick={addRule} className="text-sm px-3 py-1 rounded border dark:text-white/90 ">Agregar regla</button>
            </div>
            <div className="mt-3 space-y-3">
              {rulePrice.map((r, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                <select
                    className="border rounded p-2 w-full mb-2"
                    value={r.clientType}
                    onChange={(e) => updateRule(idx, { clientType: e.target.value })}
                    >
                    <option value="" disabled>
                        Seleccionar tipo cliente
                    </option>
                    {CLIENT_TYPES.filter(
                        (type) => !rulePrice.some((rp, i) => i !== idx && rp.clientType === type)
                    ).map((type) => (
                        <option key={type} value={type}>
                        {type}
                        </option>
                    ))}
                </select>

                  <input
                    type="number"
                    value={r.percentage}
                    onChange={(e) => updateRule(idx, { percentage: Number(e.target.value) })}
                    className="h-10 w-28 rounded-lg border px-3 dark:text-white/90 "
                  />
                  <button onClick={() => removeRule(idx)} className="px-3 py-2 rounded border text-sm dark:text-white/90 ">Eliminar</button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setReference("");
                setTitle("");
                setDescription("");
                setBasePrice("");
                setActive(true);
                // setFileIds([]);
                setMainPhoto(null);
                setRulePrice([{ clientType: "A", percentage: 20 }]);
                setSelectedSubclasses([]);
              }}
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
            >
              Limpiar
            </button>
            <button onClick={handleSubmit} className="btn btn-success flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white">
              Crear producto
            </button>
          </div>
        </div>

        {/* Right column: fotos + subclases */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Fotos (múltiples)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleAddFiles(e.target.files)}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Foto principal</label>
            <div className="flex gap-2 flex-wrap">
              {fileIds.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-white/90 ">No hay fotos. Sube imágenes para seleccionar una principal.</div>
              )}
              {fileIds.map((id) => (
                <div key={id} className="relative w-28">
                  <img src={fileInfos[id]?.url || `/api/files/${id}/thumb`} alt="thumb" className={`h-20 w-28 object-cover rounded-lg border ${mainPhoto === id ? "ring-4 ring-brand-300" : ""}`} />
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => handleSetMainPhoto(id)} className="text-xs px-2 py-1 rounded border">Principal</button>
                    <button onClick={() => handleRemoveFile(id)} className="text-xs px-2 py-1 rounded border">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Buscar Subclases</label>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Buscar por nombre" className="dark:text-white/90  h-10 w-full rounded-lg border px-3" />
            <div className="mt-3 max-h-64 overflow-auto">
              {loading && <div className="text-sm text-gray-500 dark:text-white/90 ">Cargando...</div>}
              {error && <div className="text-sm text-red-500 dark:text-white/90 ">Error cargando subclases</div>}
              {searchText && data?.SubClasses?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <div className="font-medium dark:text-white/90 ">{s.name}</div>
                    <div className="text-xs text-gray-500 dark:text-white/90 ">{s.class?.name}</div>
                  </div>
                  <div>
                    <button onClick={() => toggleSubclass(s)} className={`px-3 py-1 rounded border text-sm dark:text-white/90  ${selectedSubclasses.includes(s.id) ? "bg-brand-500 text-white" : ""}`}>
                      {selectedSubclasses.includes(s.id) ? "Seleccionada" : "Seleccionar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium dark:text-white/90 ">Subclases seleccionadas</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedSubclasses.map((subclases) => (
                  <div key={subclases.id} className="px-3 py-1 rounded bg-gray-100 text-sm flex items-center gap-2">
                    <div>
                        <div className="font-medium">{subclases.name}</div>
                        <div className="text-xs text-gray-500">{subclases.class?.name}</div>
                    </div>
                    <button onClick={() => toggleSubclass(subclases)} className="text-xs">x</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
