import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, pointOnSphere, randomRange } from '../utils/math';
import { starFragmentShader, starVertexShader } from './shaders/starfield';

export interface StarFieldProps {
  count: number;
  /** Outer radius of the shell. */
  radius: number;
  /** Stars are never generated closer than this to the shell centre. */
  innerRadius?: number;
  sizeScale?: number;
  opacity?: number;
  seed?: number;
  /** Distance at which stars fade out, used to build depth. */
  farFade?: number;
  /** Slow rotation of the whole shell adds life without breaking parallax. */
  spin?: number;
  palette?: string[];
  /** Flattens the shell into a disc — used for galactic-plane density. */
  flatten?: number;
}

const DEFAULT_PALETTE = ['#F4F7FF', '#CFE4FF', '#9FC6FF', '#00E5FF', '#9D4EDD', '#FFD9F3'];

/**
 * Tens of thousands of stars in a single `THREE.Points` draw call.
 * Geometry and material are built once and explicitly disposed, so navigating
 * between worlds never leaks GPU memory.
 */
export function StarField({
  count,
  radius,
  innerRadius = radius * 0.22,
  sizeScale = 1,
  opacity = 1,
  seed = 1337,
  farFade = radius * 1.4,
  spin = 0.004,
  palette = DEFAULT_PALETTE,
  flatten = 1,
}: StarFieldProps) {
  const groupRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, viewport } = useThree();

  const geometry = useMemo(() => {
    const rng = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkles = new Float32Array(count);

    const colorObjects = palette.map((hex) => new THREE.Color(hex));

    for (let i = 0; i < count; i += 1) {
      // Cube-root distribution gives a uniform volume instead of a hollow shell.
      const distance = innerRadius + (radius - innerRadius) * Math.cbrt(rng());
      const [x, y, z] = pointOnSphere(rng, distance);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y * flatten;
      positions[i * 3 + 2] = z;

      // Most stars are white/blue; coloured ones stay rare so it reads natural.
      const roll = rng();
      const colorIndex =
        roll > 0.93 ? 3 + Math.floor(rng() * (colorObjects.length - 3)) : Math.floor(rng() * 3);
      const colour = colorObjects[Math.min(colorIndex, colorObjects.length - 1)];
      colors[i * 3] = colour.r;
      colors[i * 3 + 1] = colour.g;
      colors[i * 3 + 2] = colour.b;

      sizes[i] = randomRange(rng, 0.45, 2.3) * (roll > 0.985 ? 2.6 : 1);
      twinkles[i] = rng();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 1.1);
    return geo;
  }, [count, radius, innerRadius, seed, palette, flatten]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSizeScale: { value: sizeScale },
        uOpacity: { value: opacity },
        uFarFade: { value: farFade },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [sizeScale, opacity, farFade]);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      material.dispose();
    };
  }, [material]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Keep point size consistent across DPR / resize.
  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(viewport.dpr || 1, 2);
  }, [material, viewport.dpr, size.width, size.height]);

  useEffect(() => {
    material.uniforms.uOpacity.value = opacity;
  }, [material, opacity]);

  useFrame((_state, delta) => {
    material.uniforms.uTime.value += delta;
    if (groupRef.current && spin !== 0) {
      groupRef.current.rotation.y += delta * spin;
    }
  });

  return (
    <points ref={groupRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}

export default StarField;
