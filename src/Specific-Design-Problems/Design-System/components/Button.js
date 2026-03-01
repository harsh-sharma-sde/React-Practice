import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * BUTTON COMPONENT
 * * SDE3 Architectural Decisions:
 * 1. forwardRef: Critical for library components. It allows parent components (like 
 * Tooltips or Animation libraries) to access the underlying DOM node directly.
 * 2. Rest/Spread (...rest): Adheres to the "Open-Closed Principle." The component 
 * is open for HTML attribute extension (aria-label, type, id) without modifying the source.
 */
export const Button = React.forwardRef((props, ref) => {
  const { 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    children, 
    ...rest 
  } = props;

  /**
   * CLASS NAME STRATEGY (BEM-lite)
   * * Scalability: We use a deterministic naming convention. 
   * * Performance: .filter(Boolean).join(' ') is a lightweight way to handle 
   * conditional classes without adding a heavy external library like `clsx`.
   */
  const classNames = [
    'ds-button',
    `ds-button--${variant}`, // Tied to: --ds-color-primary tokens
    `ds-button--${size}`,    // Tied to: --ds-spacing-unit tokens
    className                // Allows consumer "escape hatches" for one-off positioning
  ].filter(Boolean).join(' ');

  return (
    <button 
      ref={ref} 
      className={classNames} 
      // SDE3 Tip: Ensure 'rest' is spread last so it can override internal 
      // defaults if the consumer has a specific edge case.
      {...rest}
    >
      {/* COMPOSITION: By rendering {children}, we allow the button to contain 
        Icons, Spans, or Translatable text without needing complex props.
      */}
      {children}
    </button>
  );
});

/**
 * DEBUGGING & TOOLING
 * displayName is vital when using React.forwardRef, otherwise the component 
 * shows up as "ForwardRef" in React DevTools, making profiling difficult.
 */
Button.displayName = 'Button';

/**
 * RUNTIME CONTRACT (PropTypes)
 * In a TypeScript environment, this would be an Interface. 
 * For JS, PropTypes acts as the documentation and validation layer for consumers.
 */
Button.propTypes = {
  /** Defines the visual intent (mapped to semantic tokens) */
  variant: PropTypes.oneOf(['primary', 'secondary']),
  /** Controls padding/font-size based on the design grid */
  size: PropTypes.oneOf(['sm', 'md']),
  /** Optional override for layout-specific CSS */
  className: PropTypes.string,
  /** The clickable content. Required to ensure the button isn't 'empty' for screen readers. */
  children: PropTypes.node.isRequired,
};

export default Button;