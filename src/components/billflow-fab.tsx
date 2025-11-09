import { Button } from "./ui/button";
import { Plus, FileText, Receipt, Users, CreditCard, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const actions = [
  {
    icon: FileText,
    label: "New Invoice",
    color: "bg-blue-600 hover:bg-blue-700",
    delay: 0.1,
  },
  {
    icon: Receipt,
    label: "New Bill",
    color: "bg-purple-600 hover:bg-purple-700",
    delay: 0.15,
  },
  {
    icon: Users,
    label: "New Vendor",
    color: "bg-green-600 hover:bg-green-700",
    delay: 0.2,
  },
  {
    icon: CreditCard,
    label: "Take Payment",
    color: "bg-orange-600 hover:bg-orange-700",
    delay: 0.25,
  },
];

export function BillFlowFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 right-0 flex flex-col gap-3 items-end"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: action.delay,
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="lg"
                          className={`${action.color} text-white shadow-2xl hover:shadow-indigo-500/50 transition-all h-14 w-14 rounded-full`}
                          onClick={() => {
                            setIsOpen(false);
                            // Handle action
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-gray-900 border-gray-800 text-white">
                        {action.label}
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
