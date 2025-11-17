// Animated Box Component with Framer Motion
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { designTokens } from '../../design/tokens';

interface AnimatedBoxProps {
  children: ReactNode;
  variant?: keyof typeof designTokens.animations;
  delay?: number;
  className?: string;
  [key: string]: any;
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

  return (
    <motion.div
      initial={(animation as any).initial}
      animate={(animation as any).animate}
      exit={(animation as any).exit}
      transition={{ ...(animation as any).transition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedList = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      variants={designTokens.animations.stagger}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

export const AnimatedListItem = ({ children, index = 0 }: { children: ReactNode; index?: number }) => {
  return (
    <motion.div
      variants={designTokens.animations.slideUp}
      custom={index}
    >
      {children}
    </motion.div>
  );
};
