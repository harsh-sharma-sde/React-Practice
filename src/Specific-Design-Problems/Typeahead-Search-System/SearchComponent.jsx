import React, { useState, useRef, useEffect, useMemo } from 'react';
import useTypeahead from './hooks/useTypeahead';
import './SearchComponent.css'; // Assume basic styling for dropdown positioning

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  /**
   * SDE3 PATTERN: Ref for Focus/Click Management
   * This allows us to detect clicks outside the component without 
   * relying on brittle global selectors.
   */
  const containerRef = useRef(null);
  
  /**
   * SDE3 PATTERN: Referential Stability
   * useMemo ensures this object doesn't recreate on every render.
   * If we passed a raw object {} to useTypeahead, it might trigger 
   * unnecessary useEffect re-runs inside the hook.
   */
  const searchOptions = useMemo(() => ({
    delay: 250,      // Debounce wait time
    minChars: 2,     // Don't waste API calls for single characters
    limit: 8,        // Visual constraint
    baseUrl: 'http://localhost:8000/api/search'
  }), []);

  // Custom hook encapsulates the complex logic of debouncing/caching/fetching
  const { suggestions, isLoading, error } = useTypeahead(query, searchOptions);

  /**
   * SDE3 PATTERN: Keyboard Navigation (UX Excellence)
   * High-quality search bars must be usable without a mouse.
   * We handle common patterns: navigation, selection, and dismissal.
   */
  const handleKeyDown = (e) => {
    // Re-open dropdown if user starts navigating while it's closed
    if (!isOpen) setIsOpen(true);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Stop page from scrolling
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        // If an item is highlighted, select it; otherwise, let the form submit
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  /**
   * State Cleanup: Resetting local UI state once an item is chosen.
   */
  const handleSelect = (item) => {
    setQuery(item.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    // SDE3: Here you would typically trigger a redirect or a deeper search function
    console.log('Final Selection:', item);
  };

  /**
   * SDE3 PATTERN: Event Listener Cleanup
   * Managing global click events to handle "Click to Close".
   * We use 'mousedown' instead of 'click' for faster response.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Logic: If the click happened OUTSIDE our containerRef, close the dropdown
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Crucial: Prevent memory leaks and unintended behavior when component unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * SDE3 PATTERN: Synchronization Logic
   * Whenever the suggestions list changes (e.g., new API results), 
   * we must reset the keyboard highlight index to prevent "ghost" selections.
   */
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  return (
    <div className="search-container" ref={containerRef}>
      <div className="input-wrapper">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search documentation..."
          spellCheck="false"
          /**
           * SDE3 PATTERN: ARIA (Web Accessibility)
           * These attributes tell screen readers that this input controls a list.
           * Without these, the UI is 'invisible' to visually impaired users.
           */
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="results-listbox" // Links input to the <ul> below
        />
        {/* Visual feedback for the 'Race Condition' period when a request is out */}
        {isLoading && <div className="loading-spinner" aria-hidden="true" />}
      </div>

      {/**
       * SDE3 LOGIC: Conditional Rendering
       * We verify 3 things before rendering the list:
       * 1. Is it explicitly open?
       * 2. Do we have enough text to warrant a list?
       * 3. Do we have data or an error to show?
       */}
      {isOpen && (query.length >= searchOptions.minChars) && (
        <ul 
          id="results-listbox"
          className="suggestions-list" 
          role="listbox"
        >
          {/* Handling the Error Boundary gracefully */}
          {error && <li className="error-state" role="status">{error}</li>}
          
          {/* Handling the 'Empty' state to avoid a jarring empty box */}
          {!isLoading && suggestions.length === 0 && !error && (
            <li className="no-results">No results found for "{query}"</li>
          )}

          {suggestions.map((item, index) => (
            <li
              key={item.id}
              role="option"
              aria-selected={index === selectedIndex}
              className={`suggestion-item ${index === selectedIndex ? 'active' : ''}`}
              // Sync keyboard and mouse: hovering over an item highlights it
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => handleSelect(item)}
            >
              <span className="suggestion-text">{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchComponent;