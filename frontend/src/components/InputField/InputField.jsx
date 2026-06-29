import "./InputField.css";

export const InputField = ({ label, inputType, name, value, onChange, onBlur, error, required = true, placeholder, disabled = false }) => {
  return (
    <fieldset className="flex flex-col w-full gap-2">
      <label className="font-semibold text-sm text-gray-700">{label}</label>
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--electric)] focus:border-transparent transition-all duration-200"
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </fieldset>
  );
};

export default InputField;