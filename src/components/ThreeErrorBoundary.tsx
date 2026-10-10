import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label: string;
}

interface State {
  failed: boolean;
}

/**
 * Drops an optional part of the 3D scene if it throws.
 *
 * Used around post-processing: some drivers refuse unusual float render
 * targets, and a thrown effect-chain error inside the R3F tree would otherwise
 * unmount the whole canvas. Losing bloom is acceptable; losing the universe is
 * not.
 */
export class ThreeErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn(
      `[3d] "${this.props.label}" failed and was disabled. The scene continues without it.`,
      error,
      info.componentStack,
    );
  }

  override render(): ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default ThreeErrorBoundary;
