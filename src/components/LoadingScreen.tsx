import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { audio } from '../audio/audioEngine';
import { useFontsReady } from '../hooks/useFonts';
import { setExperience, useExperience } from '../state/experienceStore';
import { enterUniverse, skipIntro, startAwakening } from '../state/navigation';

const BOOT_MESSAGES = [
  'INITIALIZING DEEP SPACE SYSTEM...',
  'CALIBRATING NAVIGATION...',
  "DESTINATION: MARLO'S UNIVERSE",
];

/**
 * SCENE 01 — AWAKENING IN DEEP SPACE
 *
 * The 3D awakening (darkness, the first stars, the faint nebula, a distant
 * glow) renders *behind* this overlay, so the boot sequence is a HUD on top of
 * a live scene rather than a separate splash screen.
 *
 * Progress is composed from real signals only — no artificial delay anywhere.
 * If everything is ready on the first frame, the bar fills instantly and
 * [ENTER THE UNIVERSE] appears immediately.
 */
export function LoadingScreen() {
  const phase = useExperience((s) => s.phase);
  const sceneReady = useExperience((s) => s.sceneReady);
  const soundEnabled = useExperience((s) => s.soundEnabled);
  const fontsReady = useFontsReady();
  const { progress, item, errors } = useProgress();
  const [canvasMounted, setCanvasMounted] = useState(false);

  // The canvas element exists as soon as React has committed the Experience.
  useEffect(() => {
    const check = () => {
      if (document.querySelector('canvas.experience-canvas')) {
        setCanvasMounted(true);
        return true;
      }
      return false;
    };
    if (check()) return undefined;
    const interval = window.setInterval(() => {
      if (check()) window.clearInterval(interval);
    }, 80);
    return () => window.clearInterval(interval);
  }, []);

  /**
   * Weighted from four genuine readiness signals. `progress` comes from
   * three.js' loading manager via drei, so if real assets are added later
   * (textures, models, audio files) they feed in automatically.
   */
  const percent = useMemo(() => {
    if (sceneReady) return 100;
    let value = 0;
    if (canvasMounted) value += 24;
    if (fontsReady) value += 22;
    value += (progress / 100) * 26;
    return Math.min(96, Math.round(value));
  }, [sceneReady, canvasMounted, fontsReady, progress]);

  const messageIndex = percent < 40 ? 0 : percent < 85 ? 1 : 2;

  useEffect(() => {
    setExperience({ loadProgress: percent, bootMessageIndex: messageIndex });
  }, [percent, messageIndex]);

  // Hand over to the intro the moment everything is genuinely ready.
  useEffect(() => {
    if (phase === 'boot' || phase === 'loading') {
      if (sceneReady) setExperience({ phase: 'intro' });
      else if (phase === 'boot') setExperience({ phase: 'loading' });
    }
  }, [phase, sceneReady]);

  // Start the slow drift into the dark behind the overlay.
  useEffect(() => {
    if (sceneReady) startAwakening();
  }, [sceneReady]);

  useEffect(() => {
    if (errors.length > 0) {
      console.warn(
        '[loading] some non-essential assets failed to load; continuing with procedural fallbacks.',
        errors,
      );
    }
  }, [errors]);

  if (phase === 'experience') return null;

  const ready = phase === 'intro';

  const handleEnter = async () => {
    if (soundEnabled) {
      // Must happen inside the click handler to satisfy autoplay policies.
      await audio.enable();
    }
    enterUniverse();
  };

  const handleSoundToggle = async () => {
    const next = !soundEnabled;
    setExperience({ soundEnabled: next });
    if (next) await audio.enable();
    else audio.disable();
  };

  return (
    <div className={`boot ${ready ? 'boot--ready' : ''}`} data-nav-exempt role="dialog" aria-modal="true" aria-label="Launch sequence">
      <div className="boot__frame" aria-hidden="true">
        <span className="boot__corner boot__corner--tl" />
        <span className="boot__corner boot__corner--tr" />
        <span className="boot__corner boot__corner--bl" />
        <span className="boot__corner boot__corner--br" />
      </div>

      <div className="boot__content">
        <p className="boot__eyebrow">MARLO · EXPLORE MY UNIVERSE</p>

        <div className="boot__log" aria-live="polite">
          {BOOT_MESSAGES.map((message, index) => (
            <p
              key={message}
              className={`boot__line ${index <= messageIndex ? 'is-visible' : ''} ${
                index === messageIndex ? 'is-active' : ''
              }`}
            >
              <span className="boot__cursor">›</span> {message}
            </p>
          ))}
        </div>

        <div className="boot__meter">
          <div
            className="boot__meter-track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading progress"
          >
            <div className="boot__meter-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="boot__meter-meta">
            <span>{percent.toString().padStart(3, '0')}%</span>
            <span className="boot__meter-item">
              {ready ? 'SYSTEMS NOMINAL' : item ? `LOADING ${item.slice(0, 28)}` : 'WARMING UP RENDERER'}
            </span>
          </div>
        </div>

        <div className={`boot__launch ${ready ? 'is-ready' : ''}`}>
          <p className="boot__prompt">{ready ? 'READY TO EXPLORE?' : 'STANDBY'}</p>

          <button
            type="button"
            className="holo-button holo-button--primary boot__enter"
            onClick={() => void handleEnter()}
            disabled={!ready}
          >
            <span className="holo-button__bracket">[</span>
            <span className="holo-button__label">ENTER THE UNIVERSE</span>
            <span className="holo-button__bracket">]</span>
          </button>

          <div className="boot__options">
            <button
              type="button"
              className="boot__option"
              onClick={() => void handleSoundToggle()}
              aria-pressed={soundEnabled}
            >
              <span className={`boot__option-dot ${soundEnabled ? 'is-on' : ''}`} aria-hidden="true" />
              {soundEnabled ? 'SOUND ON' : 'ENABLE SOUND'}
            </button>

            <button
              type="button"
              className="boot__option"
              onClick={() => skipIntro()}
              disabled={!ready}
            >
              SKIP INTRO →
            </button>
          </div>

          <p className="boot__hint">
            Scroll, swipe or use the arrow keys to travel. Audio stays off until you turn it on.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
