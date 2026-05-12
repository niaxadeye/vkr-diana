import { motion } from "framer-motion";

type AnimatedAuthFieldProps = {
  children: React.ReactNode;
};

export function AnimatedAuthField({ children }: AnimatedAuthFieldProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{
        duration: 0.22,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}