import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Logo Animation */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: 0.5, filter: 'grayscale(100%)' }}
          animate={{
            scale: [0.5, 1.2, 1],
            filter: ['grayscale(100%)', 'grayscale(0%)', 'grayscale(0%)']
          }}
          transition={{
            duration: 2,
            repeat: 2,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
        >
          <div className="w-16 h-16 rounded-lg hero-gradient flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold text-4xl text-foreground">
            Local<span className="text-primary">Pro</span>
          </span>
        </motion.div>

        {/* Bouncing Ball */}
        <motion.div
          className="w-4 h-4 bg-primary rounded-full"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
};

export default Loader;