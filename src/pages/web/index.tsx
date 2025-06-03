import React, { useEffect, useState } from "react";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TextArea from "../../components/form/input/TextArea";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus, Trash } from "lucide-react";
import { IconPicker } from "../../components/form/IconPicker";
import { AppData, AboutData, GalleryItem, Service, Brand, Feature, Testimonial, TeamMember, ContactData } from "./types";
import handleUploadImage from "../../lib/uptloadFile";

const fakeUploadImage = async (file: File): Promise<string> => {
  const fileInfo = await handleUploadImage(file)
  return fileInfo?.url || ''
  return new Promise((res) => setTimeout(() => res(URL.createObjectURL(file)), 500));
};

const fetchCurrentData = async (): Promise<AppData> => {
  const res = await axios.get("http://localhost:3002/about");
  return res.data.data;
};

const saveNewVersion = async (data: AppData) => {
  const versionCode = Math.random().toString().substring(2, 7);
  await axios.post("http://localhost:3002/about", {
    version: versionCode,
    data,
  });
  alert(`Guardado exitosamente como versión ${versionCode}`);
};

export default function AdminPage() {
  const [formData, setFormData] = useState<AppData | null>(null);

  useEffect(() => {
    fetchCurrentData().then(setFormData);
  }, []);

  // Handler genérico para cambios en secciones de primer nivel
  const handleChange = <K extends keyof AppData>(
    section: K,
    key: keyof AppData[K],
    value: any
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  };

  // Handler para listas (Services, Gallery, Features, etc.)
  const handleListChange = <K extends keyof AppData>(
    section: K,
    index: number,
    field: keyof AppData[K][number],
    value: any
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedList = [...prev[section]] as AppData[K][];
      updatedList[index] = {
        ...updatedList[index],
        [field]: value,
      };
      return {
        ...prev,
        [section]: updatedList,
      };
    });
  };

  // Eliminar item de lista
  const handleListRemove = <K extends keyof AppData>(section: K, index: number) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedList = [...prev[section]] as AppData[K][];
      updatedList.splice(index, 1);
      return {
        ...prev,
        [section]: updatedList,
      };
    });
  };

  // Para About.Why y About.Why2
  const handleAboutArrayChange = (
    key: keyof Pick<AboutData, "Why" | "Why2">,
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedList = [...prev.About[key]];
      updatedList[index] = value;
      return {
        ...prev,
        About: {
          ...prev.About,
          [key]: updatedList,
        },
      };
    });
  };

  const handleAboutArrayRemove = (
    key: keyof Pick<AboutData, "Why" | "Why2">,
    index: number
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedList = [...prev.About[key]];
      updatedList.splice(index, 1);
      return {
        ...prev,
        About: {
          ...prev.About,
          [key]: updatedList,
        },
      };
    });
  };

  // Agregar item a lista
  const addToList = <K extends keyof AppData>(
    section: K,
    newItem: AppData[K][number]
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: [...prev[section], newItem],
      };
    });
  };

  // Agregar item a About.Why o About.Why2
  const addToAboutArray = (key: keyof Pick<AboutData, "Why" | "Why2">) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        About: {
          ...prev.About,
          [key]: [...prev.About[key], ""],
        },
      };
    });
  };

  // Subir imagen y actualizar URL
  const handleImageUpload = async <K extends keyof AppData>(
    section: K,
    index: number,
    field: keyof AppData[K][number],
    file: File
  ) => {
    const url = await fakeUploadImage(file);
    handleListChange(section, index, field, url);
  };

  const handleSave = async () => {
    if (formData) {
      await saveNewVersion(formData);
    }
  };

  if (!formData) return <p className="p-10 text-center">Cargando...</p>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <PageMeta title="Admin CYTECH" description="Administración del contenido de CYTECH" />
      <PageBreadcrumb pageTitle="Administración" />

      <Accordion.Root type="multiple" className="space-y-4">
        {/* HEADER */}
        <Accordion.Item value="header" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Cabecera
          </Accordion.Trigger>
          <Accordion.Content className="p-4">
            <label className="block mb-1 font-semibold">Título</label>
            <Input
              value={formData.Header.title}
              onChange={(e) => handleChange("Header", "title", e.target.value)}
            />
            <label className="block mt-4 mb-1 font-semibold">Descripción</label>
            <TextArea
              value={formData.Header.paragraph}
              onChange={(e) => handleChange("Header", "paragraph", e)}
            />
          </Accordion.Content>
        </Accordion.Item>

        {/* ABOUT */}
        <Accordion.Item value="about" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Acerca de
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            <label className="block mb-1 font-semibold">Descripción</label>
            <TextArea
              value={formData.About.paragraph}
              onChange={(e) => handleChange("About", "paragraph", e)}
            />

            {["Why", "Why2"].map((key) => (
              <div key={key}>
                <h4 className="font-semibold mb-2">{key == 'Why' ? 'Izquierda' : 'Derecha'}</h4>
                {formData.About[key as keyof Pick<AboutData, "Why" | "Why2">].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => 
                        handleAboutArrayChange(
                          key as keyof Pick<AboutData, "Why" | "Why2">,
                          i,
                          e.target.value
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => 
                        handleAboutArrayRemove(
                          key as keyof Pick<AboutData, "Why" | "Why2">, 
                          i
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                  onClick={() => 
                    addToAboutArray(key as keyof Pick<AboutData, "Why" | "Why2">)
                  }
                >
                  <Plus /> Agregar
                </button>
              </div>
            ))}
          </Accordion.Content>
        </Accordion.Item>

        {/* SERVICES */}
        <Accordion.Item value="services" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Services
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            {formData.Services.map((s, i) => (
              <div key={i} className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Servicio #{i + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleListRemove("Services", i)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar servicio"
                  >
                    <Trash />
                  </button>
                </div>
                <label className="block font-semibold mb-1">Ícono</label>
                <IconPicker
                  value={s.icon}
                  onChange={(val) => handleListChange("Services", i, "icon", val)}
                />
                <label className="block mt-3 font-semibold mb-1">Nombre</label>
                <Input
                  value={s.name}
                  onChange={(e) => handleListChange("Services", i, "name", e.target.value)}
                />
                <label className="block mt-3 font-semibold mb-1">Descripción</label>
                <TextArea
                  value={s.text}
                  onChange={(e) => handleListChange("Services", i, "text", e)}
                />
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              onClick={() => addToList("Services", { icon: "", name: "", text: "" })}
            >
              <Plus /> Agregar Servicio
            </button>
          </Accordion.Content>
        </Accordion.Item>

        {/* GALLERY */}
        <Accordion.Item value="gallery" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Gallery
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            {formData.Gallery.map((img, i) => (
              <div key={i} className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Imagen #{i + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleListRemove("Gallery", i)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar imagen"
                  >
                    <Trash />
                  </button>
                </div>
                <label className="block font-semibold mb-1">Título</label>
                <Input
                  value={img.title}
                  onChange={(e) => handleListChange("Gallery", i, "title", e.target.value)}
                />
                <label className="block mt-3 font-semibold mb-1">Imagen Grande</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => 
                    e.target.files?.[0] && 
                    handleImageUpload("Gallery", i, "largeImage", e.target.files[0])
                  }
                />
                {img.largeImage && (
                  <img
                    src={img.largeImage}
                    alt={`gallery-${i}`}
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
                <label className="block mt-3 font-semibold mb-1">Imagen Pequeña</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => 
                    e.target.files?.[0] && 
                    handleImageUpload("Gallery", i, "smallImage", e.target.files[0])
                  }
                />
                {img.smallImage && (
                  <img
                    src={img.smallImage}
                    alt={`gallery-${i}`}
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              onClick={() => 
                addToList("Gallery", { 
                  title: "", 
                  largeImage: "", 
                  smallImage: "" 
                })
              }
            >
              <Plus /> Agregar Imagen
            </button>
          </Accordion.Content>
        </Accordion.Item>

        {/* MARCAS */}
        <Accordion.Item value="marcas" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Marcas
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            {formData.Marcas.map((brand, i) => (
              <div key={i} className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Marca #{i + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleListRemove("Marcas", i)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar marca"
                  >
                    <Trash />
                  </button>
                </div>
                <label className="block font-semibold mb-1">Nombre</label>
                <Input
                  value={brand.name}
                  onChange={(e) => handleListChange("Marcas", i, "name", e.target.value)}
                />
                <label className="block mt-3 font-semibold mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => 
                    e.target.files?.[0] && 
                    handleImageUpload("Marcas", i, "logo", e.target.files[0])
                  }
                />
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={`marca-${i}`}
                    className="mt-2 h-16 object-contain"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              onClick={() => addToList("Marcas", { name: "", logo: "" })}
            >
              <Plus /> Agregar Marca
            </button>
          </Accordion.Content>
        </Accordion.Item>

        {/* TESTIMONIALS */}
        <Accordion.Item value="testimonials" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Testimonials
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            {formData.Testimonials.map((testimonial, i) => (
              <div key={i} className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Testimonio #{i + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleListRemove("Testimonials", i)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar testimonio"
                  >
                    <Trash />
                  </button>
                </div>
                <label className="block font-semibold mb-1">Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => 
                    e.target.files?.[0] && 
                    handleImageUpload("Testimonials", i, "img", e.target.files[0])
                  }
                />
                {testimonial.img && (
                  <img
                    src={testimonial.img}
                    alt={`testimonio-${i}`}
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
                <label className="block mt-3 font-semibold mb-1">Nombre</label>
                <Input
                  value={testimonial.name}
                  onChange={(e) => handleListChange("Testimonials", i, "name", e.target.value)}
                />
                <label className="block mt-3 font-semibold mb-1">Testimonio</label>
                <TextArea
                  value={testimonial.text}
                  onChange={(e) => handleListChange("Testimonials", i, "text", e)}
                />
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              onClick={() => addToList("Testimonials", { img: "", text: "", name: "" })}
            >
              <Plus /> Agregar Testimonio
            </button>
          </Accordion.Content>
        </Accordion.Item>

        {/* TEAM */}
        <Accordion.Item value="team" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Team
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            {formData.Team.map((member, i) => (
              <div key={i} className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Miembro #{i + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleListRemove("Team", i)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar miembro"
                  >
                    <Trash />
                  </button>
                </div>
                <label className="block font-semibold mb-1">Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => 
                    e.target.files?.[0] && 
                    handleImageUpload("Team", i, "img", e.target.files[0])
                  }
                />
                {member.img && (
                  <img
                    src={member.img}
                    alt={`team-${i}`}
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
                <label className="block mt-3 font-semibold mb-1">Nombre</label>
                <Input
                  value={member.name}
                  onChange={(e) => handleListChange("Team", i, "name", e.target.value)}
                />
                <label className="block mt-3 font-semibold mb-1">Cargo</label>
                <Input
                  value={member.job}
                  onChange={(e) => handleListChange("Team", i, "job", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              onClick={() => addToList("Team", { img: "", name: "", job: "" })}
            >
              <Plus /> Agregar Miembro
            </button>
          </Accordion.Content>
        </Accordion.Item>

        {/* CONTACT */}
        <Accordion.Item value="contact" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Contact
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            <label className="block mb-1 font-semibold">Dirección</label>
            <Input
              value={formData.Contact.address}
              onChange={(e) => handleChange("Contact", "address", e.target.value)}
            />
            
            <label className="block mt-3 mb-1 font-semibold">Teléfono</label>
            <Input
              value={formData.Contact.phone}
              onChange={(e) => handleChange("Contact", "phone", e.target.value)}
            />
            
            <label className="block mt-3 mb-1 font-semibold">Email</label>
            <Input
              value={formData.Contact.email}
              onChange={(e) => handleChange("Contact", "email", e.target.value)}
            />
            
            <label className="block mt-3 mb-1 font-semibold">Facebook</label>
            <Input
              value={formData.Contact.facebook}
              onChange={(e) => handleChange("Contact", "facebook", e.target.value)}
            />
            
            <label className="block mt-3 mb-1 font-semibold">Instagram</label>
            <Input
              value={formData.Contact.instagram}
              onChange={(e) => handleChange("Contact", "instagram", e.target.value)}
            />
            
            <label className="block mt-3 mb-1 font-semibold">YouTube</label>
            <Input
              value={formData.Contact.youtube}
              onChange={(e) => handleChange("Contact", "youtube", e.target.value)}
            />
          </Accordion.Content>
        </Accordion.Item>

        {/* FEATURES */}
        <Accordion.Item value="features" className="border rounded">
          <Accordion.Trigger className="w-full px-4 py-3 font-bold text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            Features
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-4">
            {formData.Features.map((feature, i) => (
              <div key={i} className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Feature #{i + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleListRemove("Features", i)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar feature"
                  >
                    <Trash />
                  </button>
                </div>
                <label className="block font-semibold mb-1">Icono</label>
                <IconPicker
                  value={feature.icon}
                  onChange={(val) => handleListChange("Features", i, "icon", val)}
                />
                <label className="block mt-3 font-semibold mb-1">Título</label>
                <Input
                  value={feature.title}
                  onChange={(e) => handleListChange("Features", i, "title", e.target.value)}
                />
                <label className="block mt-3 font-semibold mb-1">Texto</label>
                <TextArea
                  value={feature.text}
                  onChange={(e) => handleListChange("Features", i, "text", e)}
                />
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              onClick={() => addToList("Features", { icon: "", title: "", text: "" })}
            >
              <Plus /> Agregar Feature
            </button>
          </Accordion.Content>
        </Accordion.Item>

        <div className="mt-10 flex justify-center">
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </Accordion.Root>
    </div>
  );
}