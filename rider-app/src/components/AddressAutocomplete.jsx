import { useState, useEffect } from 'react';

// Simple address input component - no autocomplete since backend doesn't have that endpoint
// Backend accepts addresses as plain strings (pickup and dropoff fields)
const AddressAutocomplete = ({ value, onChange, placeholder, id, name, required }) => {
  const [query, setQuery] = useState(value || '');

  // Update query when value prop changes (e.g., from parent)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    // Update parent immediately for controlled component
    onChange(e);
  };

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        name={name}
        value={query}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        placeholder={placeholder}
        required={required}
        autoComplete="address-line1"
      />
    </div>
  );
};

export default AddressAutocomplete;


