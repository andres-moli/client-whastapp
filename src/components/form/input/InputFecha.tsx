import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface InputFechaProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disabled?: boolean;
}

export const InputFecha: React.FC<InputFechaProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  required,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const ref = useRef<HTMLDivElement>(null);

  // Cierra el calendario al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
      onChange(date.toISOString().split("T")[0]);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 
          shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 
          dark:border-gray-700 dark:bg-gray-900 dark:text-white text-left cursor-pointer"
      >
        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecciona una fecha"}
      </button>

      {isOpen && (
        <div className="absolute top-[110%] left-0 z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={es}
            fromDate={minDate}
            toDate={maxDate}
            captionLayout="dropdown"
            classNames={{
              caption_label: "text-gray-700 dark:text-gray-300 text-sm font-medium",
              day_selected:
                "bg-brand-500 text-white rounded-full hover:bg-brand-600",
              day_today:
                "text-brand-600 font-semibold border border-brand-400 rounded-full",
              day: "w-9 h-9 text-sm rounded-full hover:bg-brand-100 dark:hover:bg-brand-700 text-gray-700 dark:text-gray-200",
              nav_button: "text-brand-500 hover:text-brand-600",
            }}
          />
        </div>
      )}
    </div>
  );
};
