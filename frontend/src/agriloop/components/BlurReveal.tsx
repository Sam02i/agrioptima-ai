import React from 'react';
import { motion } from 'motion/react';

interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: number;
  className?: string;
  id?: string;
  viewportMargin?: string;
  key?: React.Key;
}

export function BlurReveal({
  children,
  delay = 0,
  duration = 0.8,
  yOffset = 24,
  blur = 10,
  className = '',
  id,
  viewportMargin = '-50px',
}: BlurRevealProps) {
  return (
    <motion.div
      id={id}
      initial={{
        opacity: 0,
        y: yOffset,
        filter: `blur(${blur}px)`,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >{children}</motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  viewportMargin?: string;
}

export function StaggerContainer({
  children,
  className = '',
  viewportMargin = '-50px',
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      className={className}
    >{children}</motion.div>
  );
}
