import React from 'react';

/**
 * ErrorBoundary
 * Catches any render/lifecycle errors in its child tree and shows a
 * fallback UI instead of crashing the whole app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 *
 *   // Custom fallback:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Update state so the next render shows the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log the error for debugging (swap console.error for a logging service in production)
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught an error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Allow a custom fallback to be passed as a prop
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <span style={styles.icon}>⚠️</span>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button style={styles.button} onClick={this.handleReset}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline styles so this component has zero external dependencies
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    minHeight: '200px',
  },
  card: {
    background: '#1e1e2e',
    border: '1px solid #f38ba8',
    borderRadius: '12px',
    padding: '2rem 2.5rem',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  icon: {
    fontSize: '2rem',
  },
  title: {
    color: '#f38ba8',
    margin: '0.75rem 0 0.5rem',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  message: {
    color: '#cdd6f4',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
    lineHeight: 1.5,
  },
  button: {
    background: '#89b4fa',
    color: '#1e1e2e',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ErrorBoundary;