import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export function Success() {
  useEffect(() => {
    const fire = (delay: number, opts: confetti.Options) =>
      setTimeout(() => confetti({ ...opts, colors: ["#6B1BFF", "#FF4500", "#ffffff"] }), delay);
    fire(0, { particleCount: 120, spread: 90, origin: { y: 0.6 } });
    fire(300, { particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
    fire(500, { particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });
    fire(900, { particleCount: 100, spread: 100, origin: { y: 0.5 } });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl px-4 py-20 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ duration: 0.8 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pump-gradient text-4xl shadow-[0_0_60px_rgba(107,27,255,0.6)]"
      >
        🎉
      </motion.div>
      <h1 className="font-display text-4xl font-black uppercase text-white sm:text-5xl">
        Aplicação enviada
        <br />
        <span className="text-pump-gradient">com sucesso!</span>
      </h1>
      <p className="mt-6 text-lg text-[#CCCCCC]">
        Entraremos em contato em breve.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#FF4500]/40 bg-[#FF4500]/10 px-5 py-2 text-sm font-bold text-white">
        🔥 Apenas 3 vagas disponíveis
      </div>
    </motion.div>
  );
}
