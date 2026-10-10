/**
 * A single global pointer tracker.
 *
 * The camera rig needs the pointer position every frame. Keeping it in React
 * state would trigger a re-render on every mouse move, so one passive listener
 * writes into a plain module object that `useFrame` reads directly.
 */

export const pointer = {
  /** -1 … 1 */
  x: 0,
  /** -1 … 1 */
  y: 0,
  /** Smoothed values, updated by the camera rig. */
  smoothX: 0,
  smoothY: 0,
  active: false,
};

let installed = false;

export function installPointerTracking(): () => void {
  if (installed) return () => undefined;
  installed = true;

  const update = (clientX: number, clientY: number) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    pointer.x = (clientX / w) * 2 - 1;
    pointer.y = -((clientY / h) * 2 - 1);
    pointer.active = true;
  };

  const onMouseMove = (event: MouseEvent) => update(event.clientX, event.clientY);

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) update(touch.clientX, touch.clientY);
  };

  const onLeave = () => {
    pointer.x = 0;
    pointer.y = 0;
    pointer.active = false;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('mouseleave', onLeave);
  window.addEventListener('blur', onLeave);

  return () => {
    installed = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('blur', onLeave);
  };
}
