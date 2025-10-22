import { createContext, useContext, useState, useCallback, useEffect } from "react";

// Create Context
const FilterContext = createContext();

// Storage keys
const STORAGE_KEY_FILTERS = 'dynamicgrid_filters';
const STORAGE_KEY_SEARCHFORMS = 'dynamicgrid_searchforms';

// Helper functions for localStorage
const loadFromStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : {};
    } catch (error) {
        console.warn(`Failed to load ${key} from localStorage:`, error);
        return {};
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Failed to save ${key} to localStorage:`, error);
    }
};

export function useFilter() {
    const context = useContext(FilterContext);

    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider. Make sure your Grid component is properly set up.');
    }

    return context;
}

export function FilterProvider({ children }) {
    // Store filters as an object keyed by grid identifier (e.g., apiUrl)
    // Structure: { "companies": { Name: {...}, Status: {...} }, "users": {...} }
    // Initialize from localStorage
    const [filters, setFilters] = useState(() => loadFromStorage(STORAGE_KEY_FILTERS));

    // Store searchForm (field definitions) per grid
    // Structure: { "companies": { Name: {...}, Status: {...} }, "users": {...} }
    // Initialize from localStorage
    const [searchForms, setSearchForms] = useState(() => loadFromStorage(STORAGE_KEY_SEARCHFORMS));

    // Save filters to localStorage whenever they change
    useEffect(() => {
        saveToStorage(STORAGE_KEY_FILTERS, filters);
    }, [filters]);

    // Save searchForms to localStorage whenever they change
    useEffect(() => {
        saveToStorage(STORAGE_KEY_SEARCHFORMS, searchForms);
    }, [searchForms]);

    // Get filter for a specific grid
    const getFilter = useCallback((key) => {
        return filters[key] || {};
    }, [filters]);

    // Set filter for a specific grid
    const setFilter = useCallback((key, filterValue) => {
        setFilters((prev) => ({
            ...prev,
            [key]: typeof filterValue === 'function' ? filterValue(prev[key] || {}) : filterValue,
        }));
    }, []);

    // Clear filter for a specific grid
    const clearFilter = useCallback((key) => {
        setFilters((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    // Get searchForm for a specific grid
    const getSearchForm = useCallback((key) => {
        return searchForms[key] || {};
    }, [searchForms]);

    // Set searchForm for a specific grid
    const setSearchForm = useCallback((key, searchFormValue) => {
        setSearchForms((prev) => ({
            ...prev,
            [key]: typeof searchFormValue === 'function' ? searchFormValue(prev[key] || {}) : searchFormValue,
        }));
    }, []);

    // Backward compatibility: global filter state
    const [filter, setGlobalFilter] = useState("");

    return (
        <FilterContext.Provider value={{
            filter,
            setFilter: setGlobalFilter,
            filters,
            getFilter,
            setGridFilter: setFilter,
            clearFilter,
            searchForms,
            getSearchForm,
            setGridSearchForm: setSearchForm,
        }}>
            {children}
        </FilterContext.Provider>
    );
}