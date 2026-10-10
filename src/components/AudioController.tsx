import { useEffect } from 'react';
import { audio, type AmbientProfile } from '../audio/audioEngine';
import { getScene } from '../data/scenes';
import { useExperience } from '../state/experienceStore';

/**
 * Switches the ambient bed to match where the visitor is.
 *
 * Open space gets a wide, airy pad; inside the ship the bed drops an octave and
 * gains a filtered engine hum. Nothing plays until the visitor explicitly
 * enables sound, and muting leaves the visuals completely untouched.
 */
export function AudioController() {
  const stage = useExperience((s) => s.stage);
  const phase = useExperience((s) => s.phase);
  const soundEnabled = useExperience((s) => s.soundEnabled);

  useEffect(() => {
    if (!soundEnabled) return;
    const world = getScene(stage).world;
    const profile: AmbientProfile =
      phase !== 'experience' ? 'quiet' : world === 'cockpit' ? 'cockpit' : 'space';
    audio.setProfile(profile);
  }, [stage, phase, soundEnabled]);

  // Suspend audio when the tab is hidden — nobody wants a hum from a
  // background tab.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) audio.disable();
      else if (soundEnabled) void audio.enable();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [soundEnabled]);

  return null;
}

export default AudioController;
