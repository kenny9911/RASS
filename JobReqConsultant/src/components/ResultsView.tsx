import { RecruiterOutput } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface ResultsViewProps {
    data: RecruiterOutput;
}

export default function ResultsView({ data }: ResultsViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                    <CardTitle className="text-xl text-green-400">招聘顾问最终报告</CardTitle>
                    <CardDescription>Based on AI analysis & research</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">核心搜索关键词</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.searchKeywords?.map((kw, i) => (
                                <Badge key={i} variant="secondary" className="text-sm px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
                                    {kw}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">招聘难度评估</h3>
                        <div className="p-3 bg-white/5 rounded-md border border-white/10 text-yellow-200 prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{data.difficultyAssessment || ''}</ReactMarkdown>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>候选人画像详情</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{data.candidateProfile || '无内容'}</ReactMarkdown>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>总结</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{data.finalReport || ''}</ReactMarkdown>
                </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground pt-4">
                Job Requisition Consultation Completed
            </div>
        </div>
    );
}
