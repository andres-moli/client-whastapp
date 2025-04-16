import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { formatCurrency } from "../lib/utils";

const API_BASE_URL = `${import.meta.env.VITE_APP_GRAPH}fletes/ventasAgrupadasXmes`;

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  return (
    <header className="sticky top-0 z-99999 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      
      {/* 🧩 Fila principal (hamburguesa, logo, y botonera derecha TODO en una sola línea) */}
      <div className="flex items-center justify-between w-full px-3 py-3 lg:px-6 lg:py-4 border-b border-gray-200 dark:border-gray-800">
        {/* Izquierda: Hamburguesa + logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 lg:border"
            aria-label="Toggle Sidebar"
          >
            {/* icono hamburguesa */}
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 12l4.72 4.72a.75.75 0 11-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 01-1.06-1.06L10.94 12 6.22 7.28a.75.75 0 010-1.06z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M.58 1A.75.75 0 011.33.25h13.33a.75.75 0 010 1.5H1.33A.75.75 0 01.58 1zm0 10a.75.75 0 01.75-.75h13.33a.75.75 0 010 1.5H1.33a.75.75 0 01-.75-.75zm.75-5.75a.75.75 0 100 1.5H8a.75.75 0 000-1.5H1.33z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
  
          <Link to="/" className="lg:hidden">
            <img src="./images/logo/cytech.png" alt="Logo" className="dark:hidden" />
            <img src="./images/logo/cytech.png" alt="Logo" className="hidden dark:block" />
          </Link>
        </div>
  
        {/* Derecha: Botonera completa */}
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>

    </header>
  );
  
};

export default AppHeader;
