// chat/components/ContactInfoDrawer.tsx
import { Contact } from "../hooks/useChat";
import { X } from "lucide-react";

export default function ContactInfoDrawer({
  contact,
  open,
  onClose,
}: {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header (FIJO) */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Información del contacto
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {contact && (
            <>
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <img
                  src={
                    contact.avatar ||
                    `https://via.placeholder.com/80?text=${contact.name.charAt(0)}`
                  }
                  alt={contact.name}
                  className="w-20 h-20 rounded-full object-cover shadow-lg mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {contact.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {contact.online ? "En línea" : "Desconectado"}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {contact.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ID
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {contact.id}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grupos */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Grupos asociados
                </label>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 1, name: "Grupo 1" }, { id: 2, name: "Grupo 2" }].map(
                    (group) => (
                      <span
                        key={group.id}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium shadow-sm"
                      >
                        {group.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}