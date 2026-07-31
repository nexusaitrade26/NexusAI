import React from 'react';
import Card from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary ha intercettato un errore di rendering:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto my-12">
          <Card className="border-rose-500/40 bg-rose-950/20 space-y-4 text-center">
            <div className="text-3xl">⚠️</div>
            <h3 className="text-base font-bold text-rose-300 font-outfit">
              Si è verificato un errore temporaneo nella vista
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.toString() || 'Errore di esecuzione sconosciuto'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-liquid-glow transition-all"
            >
              Ripristina Vista Operativa
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
