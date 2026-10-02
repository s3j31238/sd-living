import React from 'react'
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise, ChromaticAberration, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

/**
 * Cinematic grade. Bloom carries the lamp emission, DoF sells the
 * macro-lens showroom look, grain + vignette keep it filmic.
 */
export default function Effects({ quality = 'high', dof = true, focus = 6.5 }) {
  if (quality === 'low') return null

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0} enableNormalPass={false}>
      {quality === 'high' && dof ? (
        <DepthOfField focusDistance={0.012} focalLength={0.045} bokehScale={4.5} height={480} />
      ) : (
        <></>
      )}
      <Bloom
        intensity={quality === 'high' ? 1.15 : 0.8}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.5}
        mipmapBlur
        radius={0.82}
      />
      {quality === 'high' ? (
        <ChromaticAberration offset={[0.00035, 0.00045]} radialModulation modulationOffset={0.3} />
      ) : (
        <></>
      )}
      <Vignette eskil={false} offset={0.24} darkness={0.92} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.32} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
