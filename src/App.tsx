import { useEffect, useMemo } from 'react';
import AppErrorBoundary from './components/AppErrorBoundary';
import AudioController from './components/AudioController';
import DestinationPanel from './components/DestinationPanel';
import HologramActions from './components/HologramActions';
import LoadingScreen from './components/LoadingScreen';
import NavigationHUD from './components/NavigationHUD';
import TransitionOverlay from './components/TransitionOverlay';
import WebGLFallback from './components/WebGLFallback';
import { useNavigationInput } from './hooks/useNavigationInput';
import { detectWebGLSupport, useSystemPreferences } from './hooks/useSystemPreferences';
import { setExperience, useExperience } from './state/experienceStore';
import Experience from './three/Experience';
import { installPointerTracking } from './utils/pointer';
import './styles/global.css';
import './styles/boot.css';
import './styles/hud.css';
import './styles/panels.css';
import './styles/fallback.css';

export function App() {
  // Probed once, before the canvas is ever created.
  const webglSupported = useMemo(() => detectWebGLSupport(), []);

  useSystemPreferences();
  useNavigationInput();

  useEffect(() => {
    setExperience({ webglSupported });
    if (!webglSupported) {
      console.warn('[app] WebGL is unavailable — serving the static portfolio fallback.');
    }
  }, [webglSupported]);

  useEffect(() => installPointerTracking(), []);

  // Remove the pre-bundle paint guard once React has mounted.
  useEffect(() => {
    document.getElementById('boot-veil')?.remove();
  }, []);

  const reducedMotion = useExperience((s) => s.reducedMotion);
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  }, [reducedMotion]);

  if (!webglSupported) {
    return <WebGLFallback />;
  }

  return (
    <AppErrorBoundary
      fallback={
        <WebGLFallback reason="The 3D experience hit an unexpected error and was shut down safely. The full portfolio is below." />
      }
    >
      <div className="stage">
        <Experience />
        <TransitionOverlay />
        <LoadingScreen />
        <NavigationHUD />
        <HologramActions />
        <DestinationPanel />
        <AudioController />
      </div>
    </AppErrorBoundary>
  );
}

export default App;
