import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { createRequisition } from '../../services/api';
import { FormStep } from '../../types';
import { StepIndicator } from './StepIndicator';
import { BasicInfoStep } from './BasicInfoStep';
import { ResponsibilitiesStep } from './ResponsibilitiesStep';
import { QualificationsStep } from './QualificationsStep';
import { AdditionalInfoStep } from './AdditionalInfoStep';

export function JobReqForm() {
  const { state, dispatch } = useApp();
  const { currentStep, formData, isSubmitting } = state;
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep < 4) {
      setDirection(1);
      dispatch({ type: 'SET_STEP', payload: (currentStep + 1) as FormStep });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setDirection(-1);
      dispatch({ type: 'SET_STEP', payload: (currentStep - 1) as FormStep });
    }
  };

  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.basicInfo.title.trim()) {
      toast.error('请填写职位名称');
      dispatch({ type: 'SET_STEP', payload: 1 });
      return;
    }
    if (!formData.responsibilities.trim()) {
      toast.error('请填写岗位职责');
      dispatch({ type: 'SET_STEP', payload: 2 });
      return;
    }
    if (!formData.qualifications.trim()) {
      toast.error('请填写任职资格');
      dispatch({ type: 'SET_STEP', payload: 3 });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const result = await createRequisition(formData);
      toast.success('提交成功，AI正在分析中...');
      dispatch({ type: 'SET_REQUISITION_ID', payload: result.requisitionId });
      dispatch({ type: 'SET_VIEW', payload: 'processing' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提交失败，请重试');
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.basicInfo.title.trim() !== '';
      case 2:
        return formData.responsibilities.trim() !== '';
      case 3:
        return formData.qualifications.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 步骤指示器 */}
      <StepIndicator currentStep={currentStep} />

      {/* 表单内容 */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-4 sm:p-6"
          >
            {currentStep === 1 && <BasicInfoStep />}
            {currentStep === 2 && <ResponsibilitiesStep />}
            {currentStep === 3 && <QualificationsStep />}
            {currentStep === 4 && <AdditionalInfoStep />}
          </motion.div>
        </AnimatePresence>

        {/* 导航按钮 */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`
              flex items-center justify-center gap-1 px-4 py-3 sm:py-2.5 rounded-xl font-medium transition-all gesture-feedback touch-target
              ${currentStep === 1 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-white hover:shadow-sm active:bg-slate-100'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">上一步</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`
                flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl font-medium transition-all gesture-feedback touch-target
                ${canProceed()
                  ? 'bg-primary-900 text-white hover:bg-primary-800 shadow-lg shadow-primary-900/25 active:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <span>下一步</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl font-medium transition-all gesture-feedback gradient-accent text-white shadow-lg shadow-accent-600/25 hover:shadow-xl active:shadow-md disabled:opacity-50 touch-target"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>提交分析</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <p className="mt-4 text-center text-sm text-slate-500">
        {currentStep === 4 
          ? '点击"提交分析"后，AI将开始智能分析职位需求' 
          : '请填写完整的职位信息，以获得更准确的分析结果'
        }
      </p>
    </div>
  );
}

export { JobReqForm as default };
