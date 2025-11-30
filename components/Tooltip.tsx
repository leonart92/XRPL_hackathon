import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  term: string;
  explanation: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
  term,
  explanation,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex items-center gap-1 group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <span>{children}</span>
      <button
        type="button"
        className="inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
        aria-label={`Learn more about ${term}`}
        aria-describedby={`tooltip-${term.replace(/\s+/g, '-')}`}
      >
        <HelpCircle
          className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors cursor-help"
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={`tooltip-${term.replace(/\s+/g, '-')}`}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 w-64 pointer-events-none`}
          >
            <div className="bg-slate-900 text-white text-sm rounded-lg p-3 shadow-xl">
              <div className="font-semibold mb-1">{term}</div>
              <div className="text-slate-200">{explanation}</div>
              <div
                className="absolute w-2 h-2 bg-slate-900 rotate-45"
                style={{
                  [position === 'top' ? 'bottom' : position === 'bottom' ? 'top' : position === 'left' ? 'right' : 'left']: '-4px',
                  [position === 'top' || position === 'bottom' ? 'left' : 'top']: '50%',
                  transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
