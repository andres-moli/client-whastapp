import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface SearchableMultiSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string[]) => void;
  className?: string;
  defaultValue?: string[];
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  placeholder = "Select options",
  onChange,
  className = "",
  defaultValue = [],
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropUp, setDropUp] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedValues.includes(option.value)
  );

  const handleSelect = (value: string) => {
    const newSelected = [...selectedValues, value];
    setSelectedValues(newSelected);
    onChange(newSelected);
    setSearchTerm("");
  };

  const handleRemove = (value: string) => {
    const newSelected = selectedValues.filter((v) => v !== value);
    setSelectedValues(newSelected);
    onChange(newSelected);
  };

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 250;
      setDropUp(spaceBelow < dropdownHeight);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    setSelectedValues(defaultValue);
  }, [defaultValue]);
  
  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        className="min-h-11 w-full flex items-center flex-wrap gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          selectedValues.map((val) => {
            const label = options.find((opt) => opt.value === val)?.label || val;
            return (
              <span
                key={val}
                className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1 text-sm"
              >
                {label}
                <X size={12} className="cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(val);
                }} />
              </span>
            );
          })
        )}
        <div className="ml-auto">
          <ChevronDown size={18} className="text-gray-400" />
        </div>
      </div>
      {isOpen && (
        <div
          className={`absolute left-0 w-full mt-1 z-10 rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 ${
            dropUp ? "bottom-full mb-1" : "top-full"
          }`}
        >
          <div className="relative p-2">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-10 py-2 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className="px-4 py-2 text-sm cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No hay opciones
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
