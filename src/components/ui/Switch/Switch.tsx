import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block w-10 h-6 rounded-full ${checked ? "bg-blue-600" : "bg-gray-300"} ${disabled ? "opacity-50" : ""}`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? "translate-x-full" : ""} ${disabled ? "opacity-50" : ""}`}
        ></div>
      </div>
    </label>
  );
};

export { Switch };
