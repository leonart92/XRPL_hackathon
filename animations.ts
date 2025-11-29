import { Variants } from 'framer-motion';

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Stagger container
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Fade in up
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Fade in left
export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Fade in right
export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Scale in
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Card hover
export const cardHover = {
  rest: {
    scale: 1,
    y: 0
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Button hover
export const buttonHover = {
  rest: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  tap: {
    scale: 0.95
  }
};

// Shimmer effect
export const shimmer: Variants = {
  initial: {
    backgroundPosition: '-200% 0'
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 1
    }
  }
};

// Pulse
export const pulse: Variants = {
  initial: {
    scale: 1,
    opacity: 1
  },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

// Slide in from bottom
export const slideInBottom: Variants = {
  initial: {
    y: '100%',
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Table row animation
export const tableRowVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.05,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }),
  hover: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    transition: {
      duration: 0.2
    }
  }
};

// Floating animation
export const floating: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

// Glow effect
export const glowEffect: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)'
  },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0.4)',
      '0 0 20px 10px rgba(59, 130, 246, 0)',
      '0 0 0 0 rgba(59, 130, 246, 0)'
    ],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 1
    }
  }
};

// Modal backdrop
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
    backdropFilter: 'blur(0px)'
  },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.3
    }
  }
};

// Modal content
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Number counter animation helper
export const animateNumber = (
  element: HTMLElement | null,
  endValue: number,
  duration: number = 2,
  decimals: number = 2,
  suffix: string = ''
) => {
  if (!element) return;

  const startValue = 0;
  const startTime = Date.now();

  const updateNumber = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / (duration * 1000), 1);

    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = startValue + (endValue - startValue) * easeOutQuart;

    element.textContent = `${currentValue.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  };

  requestAnimationFrame(updateNumber);
};