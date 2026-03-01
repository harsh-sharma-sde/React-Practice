import React, { createContext, useEffect, useState, useContext } from 'react';

/**
 * THEME CONTEXT
 * Purpose: Provides a mechanism to track theme loading states 
 * and prevents child components from rendering with "broken" styles.
 */
const ThemeContext = createContext();

export const ThemeProvider = ({ brandId, children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * DESIGN TOKEN SYNCHRONIZATION
     * Fetches brand-specific tokens and hydrates the DOM with CSS Variables.
     */
    async function fetchTokens() {
      try {
        // PERFOMANCE: In a production SDE3 environment, this endpoint 
        // should be behind a CDN (Edge) to minimize TTFB (Time to First Byte).
        const response = await fetch(`http://localhost:5000/api/v1/tokens/${brandId}`);
        const data = await response.json();

        const root = document.documentElement;

        /**
         * BATCHED STYLE INJECTION
         * We map API tokens to standardized CSS variable names.
         * Using CSS Variables (Custom Properties) is superior to React State for theming
         * because it avoids re-rendering the entire React tree when a theme changes.
         */
        root.style.setProperty('--ds-color-primary', data.colors.primary);
        root.style.setProperty('--ds-color-text', data.colors.text);
        root.style.setProperty('--ds-spacing-unit', data.spacing.unit);

        // OPTIONAL: Add a class to signal that tokens are ready (for CSS-only transitions)
        root.classList.add('ds-ready');

      } catch (error) {
        /**
         * RESILIENCE / ERROR BOUNDARY
         * Design systems are mission-critical. If the API fails, we MUST
         * apply a fail-safe theme to ensure the app remains functional.
         */
        console.error("Design System Error: Failed to fetch tokens", error);
        document.documentElement.classList.add('ds-fallback-theme');
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, [brandId]); // Re-run if brand changes (e.g., in a multi-tenant dashboard)

  return (
    <ThemeContext.Provider value={{ loading }}>
      {/* FOUC PREVENTION (Flash of Unstyled Content):
        We block rendering until tokens are injected into the DOM.
        SDE3 Optimization: For SEO-sensitive pages, we would prefer 
        SSR (Server-Side Rendering) to bake these variables into the HTML string.
      */}
      {!loading ? children : <div className="ds-skeleton-loader">Loading Brand Assets...</div>}
    </ThemeContext.Provider>
  );
};