import { useState } from 'react';
import { Eye, Edit3, Send, Loader2 } from 'lucide-react';

interface PreviewEditProps {
  initialSummary: string;
  initialDescription: string;
  onSubmit: (summary: string, description: string) => void;
  isSubmitting: boolean;
}

export default function PreviewEdit({
  initialSummary,
  initialDescription,
  onSubmit,
  isSubmitting
}: PreviewEditProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [description, setDescription] = useState(initialDescription);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    if (!summary.trim() || !description.trim()) {
      alert('件名と詳細は必須です');
      return;
    }
    onSubmit(summary, description);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
              {isEditing ? (
                <Edit3 className="w-6 h-6 text-slate-700" />
              ) : (
                <Eye className="w-6 h-6 text-slate-700" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? '編集モード' : 'プレビュー'}
              </h2>
              <p className="text-sm text-slate-600">
                {isEditing ? '内容を修正できます' : 'AI生成結果を確認してください'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {isEditing ? 'プレビューに戻る' : '編集する'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              件名 <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-lg"
                placeholder="課題の件名を入力"
              />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-lg font-medium text-slate-900">{summary}</p>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">{summary.length} 文字</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              詳細 <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm"
                placeholder="課題の詳細を入力"
              />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-sans text-slate-900 leading-relaxed">
                  {description}
                </pre>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">{description.length} 文字</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !summary.trim() || !description.trim()}
            className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl hover:bg-slate-800 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Backlogに起票中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Backlogに起票する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
