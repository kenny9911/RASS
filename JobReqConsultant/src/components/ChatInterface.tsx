'use client';
import { useState, useRef, useEffect } from 'react';
import { ConsultationState, submitConsultation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Square, PlusSquare } from 'lucide-react';
import ResultsView from './ResultsView';
import { HistoryList } from './HistoryList';
import { ConsultationSession } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

const initialState: ConsultationState = {
    step: 'INITIAL',
    iteration: 0,
    jobInput: { responsibilities: '', qualifications: '' },
    history: [],
    messages: [{ role: 'assistant', content: '您好，我是您的AI招聘顾问团队。\n请把您想招聘职位的**主要职责** (Responsibilities) 和 **任职要求** (Qualifications) 发给我，我会为您制定招聘方案。' }],
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 }
};

export default function ChatInterface() {
    const [state, setState] = useState<ConsultationState>(initialState);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleSelectSession = (session: ConsultationSession) => {
        setState({
            id: session.id,
            step: session.step || 'COMPLETED',
            iteration: 0, // Not critical for view-only
            jobInput: session.jobInput || { responsibilities: '', qualifications: '' },
            analysis: session.analysis,
            research: session.research,
            recruiter: session.finalResult,
            history: session.history || [],
            messages: session.messages,
            usage: session.usage
        });
    };

    const handleNewSession = () => {
        if (loading && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setState(initialState);
        setInput('');
        setLoading(false);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages, loading]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-resize logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset to calculate scrollHeight
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userInput = input;
        setInput('');
        setLoading(true);

        // Optimistic UI update
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, { role: 'user', content: userInput }]
        }));

        try {
            const formData = new FormData();
            formData.set('input', userInput);

            // Note: Server Actions cannot be truly aborted client-side in the same way fetch can, 
            // but we can ignore the result if "cancelled"
            abortControllerRef.current = new AbortController();

            const newState = await submitConsultation(state, formData);

            if (!abortControllerRef.current.signal.aborted) {
                setState(newState);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
            abortControllerRef.current = null;
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
            // Optionally add a "Cancelled" message
            setState(prev => ({
                ...prev,
                messages: [...prev.messages, { role: 'assistant', content: '_Request stopped by user._' }]
            }));
        }
    };

    const isCompleted = state.step === 'COMPLETED';

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="p-4 border-b border-white/10 flex items-center justify-between bg-card z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <HistoryList onSelect={handleSelectSession} />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNewSession}
                        className="text-muted-foreground hover:text-foreground"
                        title="New Chat"
                    >
                        <PlusSquare size={20} />
                    </Button>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hidden sm:block">
                        AI 招聘顾问
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-muted-foreground hidden sm:block">Premium Agent Team</div>
                    {(state.usage?.totalTokens || 0) > 0 && (
                        <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-white/5 text-[10px] sm:text-xs">
                            <div className="flex flex-col sm:flex-row gap-x-3 gap-y-0">
                                <div className="text-gray-400">
                                    <span className="text-muted-foreground mr-1">In:</span>
                                    {state.usage.inputTokens.toLocaleString()}
                                </div>
                                <div className="text-gray-400">
                                    <span className="text-muted-foreground mr-1">Out:</span>
                                    {state.usage.outputTokens.toLocaleString()}
                                </div>
                                <div className="text-blue-300 font-medium">
                                    <span className="text-muted-foreground mr-1">Total:</span>
                                    {state.usage.totalTokens.toLocaleString()}
                                </div>
                            </div>
                            <div className="w-px h-3 bg-white/10 hidden sm:block" />
                            <div className="text-green-300 font-medium">
                                <span className="text-muted-foreground mr-1">Cost:</span>
                                ${state.usage?.estimatedCost?.toFixed(4) || '0.0000'}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <ScrollArea className="flex-1 p-4 h-full">
                <div className="space-y-6 pb-4">
                    {state.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="w-8 h-8 mt-1 border border-white/10">
                                    {msg.role === 'assistant' ? (
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white"><Bot size={16} /></AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-muted text-muted-foreground"><User size={16} /></AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-md
                   ${msg.role === 'user'
                                        ? 'bg-zinc-700 text-white rounded-tr-none'
                                        : 'bg-muted/50 text-foreground rounded-tl-none border border-white/5'}`}>
                                    <div className="prose prose-invert prose-sm max-w-none break-words">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <Avatar className="w-8 h-8 mt-1"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white"><Bot size={16} /></AvatarFallback></Avatar>
                                <div className="p-3 rounded-2xl bg-muted/50 text-foreground rounded-tl-none border border-white/5 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                    <span className="text-xs text-muted-foreground">AI 团队协同工作中...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCompleted && state.recruiter && (
                        <ResultsView data={state.recruiter} />
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>
            </ScrollArea>

            {!isCompleted && (
                <div className="p-4 bg-card/80 backdrop-blur-md border-t border-white/5 z-20">
                    <form onSubmit={handleSubmit} className="relative flex gap-2 items-end">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="请输入需求或回答问题 (Shift+Enter 换行)..."
                            className="pr-12 bg-muted/30 border-white/10 focus-visible:ring-blue-500/50 min-h-[44px] max-h-[200px] resize-none py-3"
                            disabled={loading}
                            rows={1}
                        />
                        <div className="absolute right-1.5 bottom-1.5">
                            {loading ? (
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={handleStop}
                                    className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 animate-in fade-in zoom-in"
                                >
                                    <Square size={12} fill="currentColor" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim()}
                                    className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 transition-all"
                                >
                                    <Send size={14} />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
