import { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface KeywordsCardProps {
  keywords: string[];
}

export function KeywordsCard({ keywords }: KeywordsCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyKeyword = (keyword: string, index: number) => {
    navigator.clipboard.writeText(keyword);
    setCopiedIndex(index);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join(', '));
    toast.success('已复制全部关键词');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-accent-600" />
          <h2 className="font-semibold text-slate-900">搜索关键词</h2>
        </div>
        <button
          onClick={copyAll}
          className="text-xs text-accent-600 hover:text-accent-700 font-medium"
        >
          复制全部
        </button>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-500 mb-4">
          以下关键词可用于在招聘平台搜索候选人
        </p>

        <div className="space-y-2">
          {keywords.map((keyword, index) => (
            <div
              key={index}
              onClick={() => copyKeyword(keyword, index)}
              className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-accent-50 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-accent-100 text-accent-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-700 group-hover:text-accent-700">
                  {keyword}
                </span>
              </div>
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-accent-600 transition-colors" />
              )}
            </div>
          ))}
        </div>

        {keywords.length === 0 && (
          <p className="text-center text-slate-400 py-4">暂无关键词</p>
        )}
      </div>
    </div>
  );
}
