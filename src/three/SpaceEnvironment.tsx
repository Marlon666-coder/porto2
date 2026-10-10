import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const envVertexShader = /* glsl */ `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const envFragmentShader = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uAccentA;
uniform vec3 uAccentB;
varying vec3 vPosition;

void main() {
  vec3 dir = normalize(vPosition);
  float h = dir.y * 0.5 + 0.5;
  vec3 colour = mix(uBottom, uTop, h);

  // Two soft light sources give metals something to reflect.
  float keyLight = pow(max(dot(dir, normalize(vec3(0.55, 0.35, 0.75))), 0.0), 7.0);
  float rimLight = pow(max(dot(dir, normalize(vec3(-0.7, -0.15, -0.6))), 0.0), 5.0);

  colour += uAccentA * keyLight * 2.4;
  colour += uAccentB * rimLight * 1.3;

  gl_FragColor = vec4(colour, 1.0);
}
`;

/**
 * Procedural environment map.
 *
 * Metallic PBR surfaces need something to reflect or they render as black
 * silhouettes. Rather than downloading an HDRI (an asset that can fail, and a
 * large one at that), we render a tiny gradient sky with two soft light lobes
 * into a PMREM cube map at startup. Cost: a few milliseconds, once.
 */
export function SpaceEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    let generated: THREE.Texture | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    const previous = scene.environment;

    try {
      pmrem = new THREE.PMREMGenerator(gl);
      pmrem.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      const geometry = new THREE.SphereGeometry(10, 32, 16);
      const material = new THREE.ShaderMaterial({
        vertexShader: envVertexShader,
        fragmentShader: envFragmentShader,
        uniforms: {
          uTop: { value: new THREE.Color('#0C1536') },
          uBottom: { value: new THREE.Color('#03040B') },
          uAccentA: { value: new THREE.Color('#6FA8FF') },
          uAccentB: { value: new THREE.Color('#9D4EDD') },
        },
        side: THREE.BackSide,
      });
      const sky = new THREE.Mesh(geometry, material);
      envScene.add(sky);

      const target = pmrem.fromScene(envScene, 0.05);
      generated = target.texture;
      scene.environment = generated;

      geometry.dispose();
      material.dispose();
      envScene.clear();
    } catch (error) {
      console.warn('[environment] could not build procedural env map — metals will rely on lights only.', error);
    } finally {
      pmrem?.dispose();
    }

    return () => {
      scene.environment = previous;
      generated?.dispose();
    };
  }, [gl, scene]);

  return null;
}

export default SpaceEnvironment;
