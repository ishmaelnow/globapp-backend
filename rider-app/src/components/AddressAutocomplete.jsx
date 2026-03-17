import { useState, useRef, useEffect } from 'react';
import { searchAddress } from '../lib/geocoding';

const DEBOUNCE_MS = 350;
const MIN_CHARS = 3;

const AddressAutocomplete = ({ value, onChange, placeholder, id, name, required }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(searchQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      if (results.length === 1) {
        selectSuggestion(results[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (item) => {
    setQuery(item.address);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({ target: { name, value: item.address } });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(e);

    if (newValue.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(newValue), DEBOUNCE_MS);
  };

  const handleFocus = () => {
    if (query.trim().length >= MIN_CHARS && suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (query.trim().length >= MIN_CHARS && !loading) {
      fetchSuggestions(query);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        id={id}
        name={name}
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute left-4 top-full mt-1 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm z-20">
          Finding addresses...
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => selectSuggestion(item)}
              className="px-4 py-3 cursor-pointer hover:bg-primary-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-800"
            >
              {item.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
