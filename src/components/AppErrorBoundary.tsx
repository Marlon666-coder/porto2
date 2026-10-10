import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  failed: boolean;
  message: string;
}

/**
 * Top-level safety net.
 *
 * If WebGL initialisation or the 3D tree fails outright, the visitor still gets
 * the complete portfolio through the static fallback instead of a blank page.
 */
export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { failed: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[app] the 3D experience could not start.', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default AppErrorBoundary;
