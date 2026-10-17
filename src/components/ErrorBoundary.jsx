import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-[#F5EFC6]">
          <div className="bg-[#231815] border-2 border-[#4A2E27] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-black text-xl text-[#F5EFC6] uppercase">
              Brew Encountered a Hiccup
            </h3>
            <p className="font-body text-xs text-[#A5BCD6] leading-relaxed">
              We encountered a minor glitch while preparing your roastery view. Please refresh to continue brewing.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-subhead font-bold text-xs uppercase tracking-wider transition-all shadow-lg border border-[#F5EFC6]/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Roastery</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
