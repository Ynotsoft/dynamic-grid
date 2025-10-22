import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

// Create Context
const FilterContext = createContext();

// Storage keys
const COOKIE_KEY_FILTERS = 'dynamicgrid_filters';
const COOKIE_KEY_SEARCHFORMS = 'dynamicgrid_searchforms';

// Global singleton to ensure consistent state across all Grid instances
let globalFilters = null;
let globalSearchForms = null;
let globalListeners = [];

// Helper functions for cookies
const setCookie = (name, value, days = 365) => {
    try {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        const encodedValue = encodeURIComponent(JSON.stringify(value));
        document.cookie = `${name}=${encodedValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    } catch (error) {
        console.warn(`Failed to save ${name} to cookie:`, error);
    }
};

const getCookie = (name) => {
    try {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                return JSON.parse(value);
            }
        }
        return {};
    } catch (error) {
        console.warn(`Failed to load ${name} from cookie:`, error);
        return {};
    }
};

// Initialize global state from cookies on first access
const initGlobalState = () => {
    if (globalFilters === null) {
        globalFilters = getCookie(COOKIE_KEY_FILTERS);
    }
    if (globalSearchForms === null) {
        globalSearchForms = getCookie(COOKIE_KEY_SEARCHFORMS);
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
    // Initialize global state
    initGlobalState();

    // Use global state as source of truth
    const [filters, setFiltersState] = useState(globalFilters);
    const [searchForms, setSearchFormsState] = useState(globalSearchForms);

    // Ref to track if this is the current provider
    const listenerIdRef = useRef(Math.random());

    // Update global state and notify all providers
    const setFilters = useCallback((updater) => {
        setFiltersState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            globalFilters = next;
            setCookie(COOKIE_KEY_FILTERS, next);

            // Notify other FilterProvider instances
            globalListeners.forEach(listener => {
                if (listener.id !== listenerIdRef.current) {
                    listener.callback(next);
                }
            });

            return next;
        });
    }, []);

    const setSearchForms = useCallback((updater) => {
        setSearchFormsState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            globalSearchForms = next;
            setCookie(COOKIE_KEY_SEARCHFORMS, next);

            // Notify other FilterProvider instances
            globalListeners.forEach(listener => {
                if (listener.id !== listenerIdRef.current) {
                    listener.callback(next);
                }
            });

            return next;
        });
    }, []);

    // Register listener for updates from other providers
    useEffect(() => {
        const listener = {
            id: listenerIdRef.current,
            callback: (newFilters) => {
                setFiltersState(newFilters);
            }
        };

        globalListeners.push(listener);

        return () => {
            globalListeners = globalListeners.filter(l => l.id !== listener.id);
        };
    }, []);

    // Sync with global state on mount (in case another provider updated while unmounted)
    useEffect(() => {
        if (globalFilters && JSON.stringify(filters) !== JSON.stringify(globalFilters)) {
            setFiltersState(globalFilters);
        }
        if (globalSearchForms && JSON.stringify(searchForms) !== JSON.stringify(globalSearchForms)) {
            setSearchFormsState(globalSearchForms);
        }
    }, []);

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
    }, [setFilters]);

    // Clear filter for a specific grid
    const clearFilter = useCallback((key) => {
        setFilters((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, [setFilters]);

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
    }, [setSearchForms]);

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