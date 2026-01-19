'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { getHistory } from "@/app/actions";
import { ConsultationSession } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface HistoryListProps {
    onSelect: (session: ConsultationSession) => void;
}

export function HistoryList({ onSelect }: HistoryListProps) {
    const [open, setOpen] = useState(false);
    const [sessions, setSessions] = useState<ConsultationSession[]>([]);

    useEffect(() => {
        if (open) {
            getHistory().then(setSessions);
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <History size={20} />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Consultation History</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center">暂无历史记录</div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className="p-4 rounded-lg border border-white/5 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                                onClick={() => {
                                    onSelect(session);
                                    setOpen(false);
                                }}
                            >
                                <div className="font-medium text-sm mb-1">{session.title || 'Untitled Consultation'}</div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>
                                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: zhCN })}
                                    </span>
                                    <span>
                                        ${session.usage?.estimatedCost?.toFixed(3) || '0.000'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
