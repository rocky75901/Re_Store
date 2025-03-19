import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    // Initialize state from localStorage or default to true (expanded)
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarState');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('sidebarState', JSON.stringify(isOpen));
    }, [isOpen]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}; 