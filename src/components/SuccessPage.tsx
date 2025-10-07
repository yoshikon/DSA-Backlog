import { CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';

interface SuccessPageProps {
  issueKey: string;
  issueUrl: string;
  onCreateAnother: () => void;
}

export default function SuccessPage({ issueKey, issueUrl, onCreateAnother }: SuccessPageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          課題の作成が完了しました
        </h2>
        <p className="text-slate-600 mb-8">
          Backlogに課題が正常に登録されました
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
          <div className="text-sm text-slate-600 mb-2">課題キー</div>
          <div className="text-2xl font-bold text-slate-900 mb-4">{issueKey}</div>

          <a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 font-medium"
          >
            Backlogで課題を開く
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="space-y-3">
          <button
            onClick={onCreateAnother}
            className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            新しい課題を作成
          </button>

          <button
            onClick={() => window.open(issueUrl, '_blank')}
            className="w-full bg-white text-slate-900 py-3 px-6 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors font-medium"
          >
            課題を確認する
          </button>
        </div>
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">次のステップ</h3>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>・ 課題の担当者や期限を設定してください</li>
          <li>・ 関係者にSlackなどで通知してください</li>
          <li>・ 必要に応じて添付ファイルを追加してください</li>
        </ul>
      </div>
    </div>
  );
}
