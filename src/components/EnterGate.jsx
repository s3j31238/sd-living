import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { SDMark, Rule } from './Brand'
import { useStore } from '../store/useStore'

export default function EnterGate() {
  const { progress } = useProgress()
  const entered = useStore((s) => s.entered)
  const setEntered = useStore((s) => s.setEntered)
  const [pct, setPct] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPct((p) => Math.max(p, Math.round(progress)))
  }, [progress])

  useEffect(() => {
    // never trap the visitor behind a stalled asset
    const t = setTimeout(() => setReady(true), 1400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (pct >= 99) setReady(true)
  }, [pct])

  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [entered])

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="gate"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink noise"
        >
          <div className="absolute inset-0 vignette" />
          <motion.div
            className="relative flex flex-col items-center px-8 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <SDMark size={62} />
            </motion.div>

            <h1 className="mt-6 font-display text-[34px] font-light text-cream sm:text-[42px]"
              style={{ letterSpacing: '0.24em' }}>
              SD LIVING
            </h1>
            <Rule className="my-3.5" w={170} />
            <p className="eyebrow">LIGHT UP YOUR SPACE</p>

            <div className="mt-11 h-px w-[220px] overflow-hidden bg-champagne/12 sm:w-[300px]">
              <motion.div
                className="h-full bg-gradient-to-r from-gold via-champagneLight to-gold"
                animate={{ width: `${Math.max(pct, ready ? 100 : 8)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <AnimatePresence mode="wait">
              {ready ? (
                <motion.button
                  key="btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  onClick={() => setEntered(true)}
                  className="btn-ghost mt-9 !px-10 !py-4"
                >
                  ENTER THE SHOWROOM
                </motion.button>
              ) : (
                <motion.p
                  key="load"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mt-9 font-sans text-[9.5px] uppercase text-cream/30"
                  style={{ letterSpacing: '0.4em' }}
                >
                  PREPARING THE LIGHT · {Math.min(pct, 99)}%
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
