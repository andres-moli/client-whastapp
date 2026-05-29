// chat/components/ChatHeader.tsx
import { Contact } from "../hooks/useChat";
import { Search, Paperclip, MoreVertical, Menu } from "lucide-react";

interface Props {
  contact: Contact | null;
  typing?: boolean;
  onOpenInfo: () => void;
  onOpenSidebar: () => void;
}

export default function ChatHeader({
  contact,
  onOpenInfo,
  onOpenSidebar,
}: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      
      {/* Contact Info */}
      <div
        className="flex items-center gap-4 cursor-pointer group"
        onClick={onOpenInfo}
      >
        {/* Avatar */}
        <div className="relative">
          <img
            src={"/public/images/logo/sell-icon.png"}
            alt={contact?.name}
            className="w-12 h-12 rounded-full object-cover shadow-md transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-lg">
            {contact?.name || "Selecciona un chat"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {
              contact?.["senderName"]
            }
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200" onClick={onOpenSidebar}>
          <Menu size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <Search size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <Paperclip size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}