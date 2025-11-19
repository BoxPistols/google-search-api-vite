// Animated Box Component with Framer Motion
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { designTokens } from '../../design/tokens';

interface AnimatedBoxProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit'> {
  children: ReactNode;
  variant?: keyof typeof designTokens.animations;
  delay?: number;
}

export const AnimatedBox = ({
  children,
  variant = 'fadeIn',
  delay = 0,
  ...props
}: AnimatedBoxProps) => {
  const animation = designTokens.animations[variant];

  // Handle special case for stagger variant
  if (variant === 'stagger') {
    return (
      <motion.div variants={animation} initial="initial" animate="animate" {...props}>
        {children}
      </motion.div>
    );
  }

  // For standard animations (fadeIn, slideUp, slideDown, scaleIn variants)
  const anim = animation as unknown as {
    initial: { opacity: number; y?: number; scale?: number };
    animate: { opacity: number; y?: number; scale?: number };
    exit: { opacity: number; y?: number; scale?: number };
    transition: { duration: number };
  };

  return (
    <motion.div
      initial={anim.initial}
      animate={anim.animate}
      exit={anim.exit}
      transition={{ ...anim.transition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedList = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div variants={designTokens.animations.stagger} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
};

export const AnimatedListItem = ({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) => {
  return (
    <motion.div variants={designTokens.animations.slideUp} custom={index}>
      {children}
    </motion.div>
  );
};
