import { motion as Motion } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/10",
}) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
      }}
      className={cn("absolute pointer-events-none", className)}
    >
      <Motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative pointer-events-none"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[999px] pointer-events-none",
            "bg-linear-to-r to-transparent",
            gradient,
            "backdrop-blur-[3px] border border-white/30",
            "shadow-lg shadow-teal-950/10"
          )}
        />
      </Motion.div>
    </Motion.div>
  );
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      
      <ElegantShape
        delay={0.3}
        width={600}
        height={140}
        rotate={12}
        gradient="from-teal-400/20"
        className="left-[-10%] top-[20%]"
      />

      <ElegantShape
        delay={0.5}
        width={500}
        height={120}
        rotate={-15}
        gradient="from-emerald-300/20"
        className="right-[-5%] top-[75%]"
      />

      <ElegantShape
        delay={0.4}
        width={300}
        height={80}
        rotate={-8}
        gradient="from-teal-700/10"
        className="left-[10%] bottom-[10%]"
      />

      <ElegantShape
        delay={0.6}
        width={200}
        height={60}
        rotate={20}
        gradient="from-teal-200/20"
        className="right-[20%] top-[15%]"
      />
    </div>
  );
}
