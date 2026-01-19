import { motion } from 'framer-motion';
import { Check, FileText, List, Award, Settings } from 'lucide-react';
import { FormStep } from '../../types';

interface StepIndicatorProps {
  currentStep: FormStep;
}

const steps = [
  { id: 1, name: '基本信息', icon: FileText },
  { id: 2, name: '岗位职责', icon: List },
  { id: 3, name: '任职资格', icon: Award },
  { id: 4, name: '补充信息', icon: Settings },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="relative">
      {/* 进度条背景 */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 mx-8 sm:mx-16" />
      
      {/* 进度条前景 */}
      <motion.div 
        className="absolute top-5 left-0 h-0.5 bg-accent-500 mx-8 sm:mx-16"
        initial={{ width: '0%' }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.3 }}
      />

      {/* 步骤点 */}
      <div className="relative flex justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  transition-colors duration-200
                  ${isCompleted 
                    ? 'bg-accent-500 text-white' 
                    : isCurrent 
                      ? 'bg-primary-900 text-white ring-4 ring-primary-100' 
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }
                `}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              
              <span 
                className={`
                  mt-2 text-xs font-medium hidden sm:block
                  ${isCurrent ? 'text-primary-900' : 'text-slate-500'}
                `}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 移动端当前步骤名称 */}
      <div className="sm:hidden mt-4 text-center">
        <span className="text-sm font-medium text-primary-900">
          步骤 {currentStep}/4：{steps[currentStep - 1].name}
        </span>
      </div>
    </div>
  );
}
