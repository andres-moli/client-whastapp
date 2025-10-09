import React, { useEffect, useState } from "react";
import { z } from "zod";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useParams } from "react-router";
import {
  ClientType,
  CreatePriceRuleInput,
  SubClass,
  useDeleteFileMutation,
  useSubClassesQuery,
  useProductQuery,
  useUpdateProductMutation,
} from "../../domain/graphql";
import { apolloClient } from "../../main.config";
import handleUploadImage from "../../lib/uptloadFile";
import { formatCurrency } from "../../lib/utils";
import TableProductFeatured from "./TableProductFeacture";
import PageMeta from "../../components/common/PageMeta";
import TableProductRelation from "./TableProductRelation";

// Schema de validación
const productSchema = z.object({
  reference: z.string().min(1, "La referencia es requerida"),
  title: z.string().min(1, "El título es requerido"),
  description: z.string(),
  basePrice: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  active: z.boolean(),
  fileIds: z.array(z.string()),
  mainPhoto: z.string(),
  rulePrice: z.array(
    z.object({ clientType: z.string().min(1), percentage: z.number().min(0) })
  ),
  subclassIds: z.array(z.string()),
});

type RulePrice = { clientType: string; percentage: number };
const CLIENT_TYPES = ClientType ? Object.values(ClientType) : [];

export default function UpdateProduct() {
  const { id } = useParams<{ id: string }>();

  // States
  const [reference, setReference] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>("");
  const [active, setActive] = useState<boolean>(true);

  const [fileIds, setFileIds] = useState<string[]>([]);
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [fileInfos, setFileInfos] = useState<Record<string, any>>({});

  const [rulePrice, setRulePrice] = useState<RulePrice[]>([]);
  const [selectedSubclasses, setSelectedSubclasses] = useState<SubClass[]>([]);
  const [searchText, setSearchText] = useState("");

  // Queries y Mutations
  const { data: productData, loading: loadingProduct, refetch: refetchProducts } = useProductQuery({
    variables: { productId: id! },
    skip: !id,
  });
  const { data, loading, error, refetch } = useSubClassesQuery({
    variables: {
      where: { name: { _contains: searchText } },
      pagination: { skip: 0, take: 20 },
    },
  });

  const [deleteFile] = useDeleteFileMutation();
  const [updateProduct] = useUpdateProductMutation();

  useEffect(() => {
    const t = setTimeout(() => refetch(), 300);
    return () => clearTimeout(t);
  }, [searchText, refetch]);

  // Pre-cargar datos cuando se obtiene el producto
  useEffect(() => {
    if (productData?.product) {
      const p = productData.product;
      setReference(p.reference || "");
      setTitle(p.title || "");
      setDescription(p.description || "");
      setBasePrice(p.basePrice || 0);
      setActive(p.active ?? true);
      setFileIds(p.photos?.map((ph) => ph.id).filter(Boolean) || []);
      setMainPhoto(p.file?.id || null);
      setRulePrice(
        p.priceRules?.map((r) => ({
          clientType: r.clientType,
          percentage: r.percentage,
        })) || []
      );
      setFileInfos(
        p.photos?.reduce((acc, photo) => {
          acc[photo.id] = {
            url: photo.file?.url,
            name: photo.file?.fileName,
          };
          return acc;
        }, {} as Record<string, any>) || {}
      );

      setSelectedSubclasses(p.subclasses || []);
    }
  }, [productData]);

  // Manejo de imágenes
  const handleAddFiles = async (files: FileList | null) => {
    if (!files) return;
    const uploadedIds: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const dataFile = await handleUploadImage(f);
        if (dataFile) {
          uploadedIds.push(dataFile.id);
          setFileInfos((prev) => ({ ...prev, [dataFile.id]: dataFile }));
        }
      } catch (err) {
        console.error("Upload error", err);
        toast.error("Error subiendo imagen: " + f.name);
      }
    }
    setFileIds((prev) => [...prev, ...uploadedIds]);
    if (!mainPhoto && uploadedIds[0]) setMainPhoto(uploadedIds[0]);
  };

  const handleRemoveFile = async (fid: string) => {
    Swal.fire({
      title: "Eliminar foto",
      text: "¿Estás seguro?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteFile({ variables: { deleteFileId: fid } });
        setFileIds((prev) => prev.filter((x) => x !== fid));
        setFileInfos((prev) => {
          const copy = { ...prev };
          delete copy[fid];
          return copy;
        });
        if (mainPhoto === fid) setMainPhoto(null);
        toast.success("Foto eliminada");
      }
    });
  };

  const handleSetMainPhoto = (fid: string) => {
    setMainPhoto(fid);
    toast.success("Foto principal establecida");
  };

  // Subclases
  const toggleSubclass = (subclass: SubClass) => {
    setSelectedSubclasses((prev) =>
      prev.find((s) => s.id === subclass.id)
        ? prev.filter((s) => s.id !== subclass.id)
        : [...prev, subclass]
    );
    setSearchText("");
  };
  // rulePrice handlers
  const addRule = () => setRulePrice((p) => [...p, { clientType: "", percentage: 0 }]);
  const updateRule = (index: number, rule: Partial<RulePrice>) =>
    setRulePrice((p) => p.map((r, i) => (i === index ? { ...r, ...rule } : r)));
  const removeRule = (index: number) => {
    setRulePrice((p) => p.filter((_, i) => i !== index));
    const removedType = rulePrice[index]?.clientType;
    };
  // Submit
  const handleSubmit = async () => {
    const subclassIds = selectedSubclasses.map((s) => s.id);
    const parsed = productSchema.safeParse({
      reference,
      title,
      description,
      basePrice:
        typeof basePrice === "string" ? Number(basePrice || 0) : basePrice,
      active,
      fileIds,
      mainPhoto,
      rulePrice,
      subclassIds,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: "Actualizar producto",
        text: "¿Deseas guardar los cambios?",
        icon: "question",
        showCancelButton: true,
      });
      if (!confirm.isConfirmed) return;

      const updateRule: CreatePriceRuleInput[] = parsed.data.rulePrice.map(
        (r) => ({
          clientType: r.clientType as ClientType,
          percentage: r.percentage,
        })
      );

      const res = await updateProduct({
        variables: {
          updateInput: {
            id: id!,
            ...parsed.data,
            rulePrice: updateRule,
          },
        },
      });

      if (!res.data?.updateProduct) {
        toast.error("Error actualizando el producto");
        return;
      }

      if (apolloClient) {
        try {
          apolloClient.cache.evict({ fieldName: "Products" });
        } catch {}
      }

      toast.success("Producto actualizado con éxito");
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando producto");
    }
  };

  if (loadingProduct) return <div>Cargando producto...</div>;
  console.log(fileIds,fileInfos)
  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7">
      <PageMeta title={productData?.product.title || 'Producto'} description=""/>
      <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl">
        Actualizar producto
      </h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: basic info */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white/90 ">Referencia</label>
          <input
            value={reference}
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
      <div className="mt-4">
        {
          id && (
            <TableProductFeatured id={id} key={id}/>
          )
        }
      </div>
      <div className="mt-4">
        {
          id && (
          <TableProductRelation id={id} products={productData?.product.relatedProducts || []} refetch={refetchProducts}/>
          )
        }
      </div>
      <button
        onClick={handleSubmit}
        className="btn btn-success mt-6 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white"
      >
        Guardar cambios
      </button>
    </div>
  );
}
