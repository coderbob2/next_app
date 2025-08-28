import React from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

const Spinner = () => {
  const bars = Array.from({ length: 12 }); // 12 segments like the attached loader

  return (
<div className="flex flex-col items-center justify-center h-full w-full text-center p-6">
<div className="flex items-center justify-center w-20 h-20 rounded-full">
{bars.map((_, i) => (
          <motion.span
            key={i}
            className="absolute block w-1.5 h-4 bg-gray-500 rounded"
            style={{
              transform: `rotate(${i * 30}deg) translate(0, -120%)`,
              transformOrigin: "center",
            }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "linear",
              delay: i * 0.1,
            }}
          />
        ))}
</div>
<h2 className="text-lg text-gray-700">Loading...</h2>

</div>

  );
};

export const EmptyPlaceholder = () => {
return (
<div className="flex flex-col items-center justify-center h-full w-full text-center p-6">
<div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
<Inbox className="w-10 h-10 text-gray-400" />
</div>
<h2 className="text-lg font-semibold text-gray-700">No Data Available</h2>
<p className="mt-1 text-sm text-gray-500 max-w-xs">
Try adjusting your filters or adding new data.
</p>
</div>
);
};

export default Spinner;