"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

export const BrutalistModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 font-bold bg-black text-white border-[3px] border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        OPEN MODAL
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-yellow-400/90 backdrop-blur-sm"
              style={{
                backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0, rotate: "10deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              exit={{ scale: 0, rotate: "-10deg" }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full max-w-md bg-white border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-4xl font-black uppercase mb-4">Attention!</h2>
              <p className="font-medium text-lg mb-6">
                This is a high-priority alert. The design system is functioning
                at maximum capacity.
              </p>

              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-black text-white font-bold border-2 border-black hover:bg-transparent hover:text-black">
                  CONFIRM
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-white text-black font-bold border-2 border-black hover:bg-gray-100"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
