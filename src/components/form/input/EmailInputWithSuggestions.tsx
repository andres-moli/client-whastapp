import React, { useState } from "react";

interface EmailInputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  suggestedDomains?: string[];
}

const EmailInputWithSuggestions: React.FC<EmailInputWithSuggestionsProps> = ({
  value,
  onChange,
  label = "Correo electrónico",
  placeholder = "tucorreo@ejemplo.com",
  suggestedDomains = ["gmail.com", "hotmail.com", "outlook.com"],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const atIndex = newValue.indexOf("@");
    if (atIndex !== -1 && !newValue.slice(atIndex + 1).includes(".")) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (domain: string) => {
    const name = value.split("@")[0];
    const completedEmail = `${name}@${domain}`;
    onChange(completedEmail);
    setShowSuggestions(false);
  };

  return (
    <div className="mt-6">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />

        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800">
            {suggestedDomains.map((domain) => (
              <div
                key={domain}
                onClick={() => handleSuggestionClick(domain)}
                className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              >
                {`${value.split("@")[0]}@${domain}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInputWithSuggestions;
