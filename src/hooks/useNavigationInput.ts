import { useEffect } from 'react';
import {
  closeCertificate,
  closeMenu,
  closeProject,
  nextStage,
  previousStage,
  returnToUniverse,
  toggleMenu,
  toggleReducedMotion,
  toggleSound,
} from '../state/navigation';
import { getExperience } from '../state/experienceStore';

/** Pixels of accumulated wheel delta required to change scene. */
const WHEEL_THRESHOLD = 90;
/** Minimum gap between wheel-driven navigations. */
const WHEEL_COOLDOWN = 650;
const SWIPE_THRESHOLD = 60;

/**
 * Is this event coming from somewhere that must keep its own scrolling and
 * clicking? Panels, menus and modals opt out with `data-nav-exempt`, so reading
 * a long project description never fires a scene change by accident.
 */
function isExempt(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-nav-exempt]'));
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

/**
 * Wires mouse wheel, touch swipe and keyboard navigation.
 *
 * All three go through the same `goTo`-backed helpers, so the animation lock in
 * the scene controller covers every input method equally.
 */
export function useNavigationInput(): void {
  useEffect(() => {
    let accumulated = 0;
    let lastNavigation = 0;
    let resetTimer = 0;

    const canNavigate = () => {
      const state = getExperience();
      if (state.phase !== 'experience') return false;
      if (state.isTransitioning) return false;
      if (state.activeProjectId || state.activeCertificateId) return false;
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (isExempt(event.target)) return;
      if (!canNavigate()) return;

      const now = performance.now();
      if (now - lastNavigation < WHEEL_COOLDOWN) return;

      accumulated += event.deltaY;

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulated = 0;
      }, 220);

      if (Math.abs(accumulated) < WHEEL_THRESHOLD) return;

      lastNavigation = now;
      const forward = accumulated > 0;
      accumulated = 0;
      if (forward) nextStage();
      else previousStage();
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchExempt = false;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchExempt = isExempt(event.target);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (touchExempt) return;
      if (!canNavigate()) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx)) return;

      // Swipe up = travel forward, matching the wheel direction.
      if (dy < 0) nextStage();
      else previousStage();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const state = getExperience();

      if (event.key === 'Escape') {
        if (state.activeProjectId) {
          closeProject();
          return;
        }
        if (state.activeCertificateId) {
          closeCertificate();
          return;
        }
        if (state.menuOpen) {
          closeMenu();
          return;
        }
        return;
      }

      if (state.phase !== 'experience') return;
      if (state.activeProjectId || state.activeCertificateId) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          nextStage();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          previousStage();
          break;
        case 'Home':
          event.preventDefault();
          returnToUniverse();
          break;
        case 'm':
        case 'M':
          toggleMenu();
          break;
        case 's':
        case 'S':
          toggleSound();
          break;
        case 'r':
        case 'R':
          toggleReducedMotion();
          break;
        default:
          break;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(resetTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}
