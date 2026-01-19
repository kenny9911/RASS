import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FormData, ViewState, AgentProgressEvent, AnalysisResult, FormStep, AnalysisTokenUsage } from '../types';

// 初始表单数据
const initialFormData: FormData = {
  basicInfo: {
    title: '',
    department: '',
    location: '',
    type: '外包'
  },
  responsibilities: '',
  qualifications: '',
  additionalContext: {
    salary: '',
    teamSize: undefined,
    urgency: '正常',
    specialRequirements: ''
  }
};

// 状态类型
interface AppState {
  viewState: ViewState;
  currentStep: FormStep;
  formData: FormData;
  requisitionId: string | null;
  analysisResult: AnalysisResult | null;
  agentProgress: AgentProgressEvent[];
  currentIteration: number;
  isSubmitting: boolean;
  error: string | null;
  tokenUsage: AnalysisTokenUsage | null;
}

// 初始状态
const initialState: AppState = {
  viewState: 'form',
  currentStep: 1,
  formData: initialFormData,
  requisitionId: null,
  analysisResult: null,
  agentProgress: [],
  currentIteration: 0,
  isSubmitting: false,
  error: null,
  tokenUsage: null
};

// Action 类型
type AppAction =
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'SET_STEP'; payload: FormStep }
  | { type: 'UPDATE_FORM'; payload: Partial<FormData> }
  | { type: 'SET_FORM_DATA'; payload: FormData }
  | { type: 'SET_REQUISITION_ID'; payload: string }
  | { type: 'SET_ANALYSIS_RESULT'; payload: AnalysisResult }
  | { type: 'ADD_AGENT_PROGRESS'; payload: AgentProgressEvent }
  | { type: 'SET_AGENT_PROGRESS'; payload: AgentProgressEvent[] }
  | { type: 'SET_ITERATION'; payload: number }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOKEN_USAGE'; payload: AnalysisTokenUsage }
  | { type: 'LOAD_HISTORY'; payload: { formData: FormData; analysisResult?: AnalysisResult; agentProgress?: AgentProgressEvent[]; tokenUsage?: AnalysisTokenUsage; requisitionId?: string } }
  | { type: 'RESET' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, viewState: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_REQUISITION_ID':
      return { ...state, requisitionId: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload };
    case 'ADD_AGENT_PROGRESS':
      return { ...state, agentProgress: [...state.agentProgress, action.payload] };
    case 'SET_AGENT_PROGRESS':
      return { ...state, agentProgress: action.payload };
    case 'SET_ITERATION':
      return { ...state, currentIteration: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TOKEN_USAGE':
      return { ...state, tokenUsage: action.payload };
    case 'LOAD_HISTORY':
      return {
        ...state,
        formData: action.payload.formData,
        analysisResult: action.payload.analysisResult || null,
        agentProgress: action.payload.agentProgress || [],
        tokenUsage: action.payload.tokenUsage || null,
        requisitionId: action.payload.requisitionId || null,
        viewState: action.payload.analysisResult ? 'results' : 'form',
        currentStep: 1,
        currentIteration: action.payload.agentProgress?.filter(e => e.type === 'iteration_complete').length || 0
      };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
