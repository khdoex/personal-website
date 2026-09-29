import {
  Camera,
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  ClampToEdgeWrapping,
  WebGLRenderTarget,
  type IUniform,
  type Texture,
  type WebGLRenderer,
} from 'three'
import { noise } from './glsl'

/**
 * Renders a function of direction into an equirectangular texture, once.
 * Noise that would cost six octaves per pixel per frame costs one texture
 * read instead. `body` is GLSL that reads `vec3 dir` (unit length, the same
 * frame as geo() in math.ts) and writes `vec4 color`.
 */
export function bakeEquirect(
  renderer: WebGLRenderer,
  width: number,
  body: string,
  uniforms: Record<string, IUniform>,
  { octaves, mipmaps, hdr }: { octaves: number; mipmaps: boolean; hdr: boolean }
): { texture: Texture; dispose: () => void } {
  const target = new WebGLRenderTarget(width, width / 2, {
    type: hdr ? HalfFloatType : undefined,
    depthBuffer: false,
    generateMipmaps: mipmaps,
    minFilter: mipmaps ? LinearMipmapLinearFilter : LinearFilter,
    magFilter: LinearFilter,
  })
  target.texture.wrapS = RepeatWrapping
  target.texture.wrapT = ClampToEdgeWrapping

  const material = new ShaderMaterial({
    uniforms,
    defines: { OCTAVES: octaves },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${noise}
      varying vec2 vUv;
      ${Object.keys(uniforms)
        .map((name) => `uniform ${glslType(uniforms[name].value)} ${name};`)
        .join('\n')}
      void main() {
        // u runs west to east from longitude -180, v south to north, the
        // layout three's SphereGeometry expects.
        float lon = (vUv.x - 0.5) * 6.28318530718;
        float lat = (vUv.y - 0.5) * 3.14159265359;
        vec3 dir = vec3(cos(lat) * cos(lon), sin(lat), -cos(lat) * sin(lon));
        vec4 color = vec4(0.0);
        ${body}
        gl_FragColor = color;
      }
    `,
    depthTest: false,
    depthWrite: false,
  })

  const quad = new Mesh(new PlaneGeometry(2, 2), material)
  const scene = new Scene()
  scene.add(quad)
  const previous = renderer.getRenderTarget()
  renderer.setRenderTarget(target)
  renderer.render(scene, new Camera())
  renderer.setRenderTarget(previous)
  quad.geometry.dispose()
  material.dispose()

  return { texture: target.texture, dispose: () => target.dispose() }
}

function glslType(value: unknown): string {
  if (typeof value === 'number') return 'float'
  const v = value as { isColor?: boolean; isVector3?: boolean; isVector2?: boolean }
  if (v?.isColor || v?.isVector3) return 'vec3'
  if (v?.isVector2) return 'vec2'
  throw new Error('bakeEquirect: unsupported uniform type')
}
