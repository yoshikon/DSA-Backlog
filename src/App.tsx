import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { SelectedItem } from './types/template';
import { defaultTemplate } from './data/defaultTemplate';
import LoginPage from './components/LoginPage';
import ProjectSelection from './components/ProjectSelection';
import TemplateSelection from './components/TemplateSelection';
import PreviewEdit from './components/PreviewEdit';
import SuccessPage from './components/SuccessPage';
import AdminPanel from './components/AdminPanel';
import BacklogSettings from './components/BacklogSettings';
import { LogOut, FileText, Settings, Link as LinkIcon } from 'lucide-react';
import { supabase } from './lib/supabase';

type Step = 'project' | 'template' | 'preview' | 'success';
type View = 'main' | 'admin' | 'settings';

interface ProjectData {
  backlogProjectId: string;
  issueType: string;
  priority: string;
  assignee: string;
}

function App() {
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('main');
  const [step, setStep] = useState<Step>('project');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueResult, setIssueResult] = useState<{ issueKey: string; issueUrl: string } | null>(null);

  const handleProjectNext = (data: ProjectData) => {
    setProjectData(data);
    setStep('template');
  };

  const handleGenerate = async (items: SelectedItem[]) => {
    setSelectedItems(items);
    setIsGenerating(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-issue-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedItems: items,
            template: defaultTemplate
          })
        }
      );

      if (!response.ok) {
        throw new Error('AI生成に失敗しました');
      }

      const data = await response.json();
      setGeneratedSummary(data.summary);
      setGeneratedDescription(data.description);
      setStep('preview');

      if (user) {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'generate_content',
          resource_type: 'generation',
          details: {
            itemCount: items.length,
            summaryLength: data.summary.length,
            descriptionLength: data.description.length
          }
        });
      }
    } catch (error) {
      console.error('生成エラー:', error);
      alert('AI生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitToBacklog = async (summary: string, description: string) => {
    if (!projectData) return;

    setIsSubmitting(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-backlog-issue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            backlogProjectId: projectData.backlogProjectId,
            summary,
            description,
            issueType: projectData.issueType,
            priority: projectData.priority,
            assignee: projectData.assignee,
            selectedItems,
            templateVersion: defaultTemplate.version
          })
        }
      );

      if (!response.ok) {
        throw new Error('課題作成に失敗しました');
      }

      const data = await response.json();
      setIssueResult(data);
      setStep('success');
    } catch (error) {
      console.error('起票エラー:', error);
      alert('Backlogへの起票に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setStep('project');
    setProjectData(null);
    setSelectedItems([]);
    setGeneratedSummary('');
    setGeneratedDescription('');
    setIssueResult(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  WebProd Issue Template Agent
                </h1>
                <p className="text-xs text-slate-600">Backlog課題テンプレート生成システム</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">{user.email}</span>
              <button
                onClick={() => setView('settings')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Backlog設定
              </button>
              <button
                onClick={() => setView(view === 'main' ? 'admin' : 'main')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
              >
                {view === 'main' ? (
                  <>
                    <Settings className="w-4 h-4" />
                    管理画面
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    メイン画面
                  </>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'settings' ? (
          <BacklogSettings />
        ) : view === 'admin' ? (
          <AdminPanel />
        ) : (
          <>
            {!isGenerating && step !== 'success' && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2">
                  {['project', 'template', 'preview'].map((s, idx) => {
                    const stepLabels = {
                      project: 'プロジェクト選択',
                      template: 'テンプレート選択',
                      preview: 'プレビュー・起票'
                    };
                    const currentIdx = ['project', 'template', 'preview'].indexOf(step);
                    const isActive = idx === currentIdx;
                    const isCompleted = idx < currentIdx;

                    return (
                      <div key={s} className="flex items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isActive ? 'bg-slate-900 text-white' :
                          isCompleted ? 'bg-green-100 text-green-700' :
                          'bg-slate-200 text-slate-500'
                        }`}>
                          <span className="text-sm font-medium">{idx + 1}</span>
                          <span className="text-sm font-medium">
                            {stepLabels[s as keyof typeof stepLabels]}
                          </span>
                        </div>
                        {idx < 2 && (
                          <div className={`w-12 h-0.5 ${
                            isCompleted ? 'bg-green-500' : 'bg-slate-300'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isGenerating ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
                  <p className="text-slate-700 font-medium">AIが件名と詳細を生成しています...</p>
                  <p className="text-sm text-slate-600 mt-2">しばらくお待ちください</p>
                </div>
              </div>
            ) : (
              <>
                {step === 'project' && <ProjectSelection onNext={handleProjectNext} />}
                {step === 'template' && <TemplateSelection onGenerate={handleGenerate} />}
                {step === 'preview' && (
                  <PreviewEdit
                    initialSummary={generatedSummary}
                    initialDescription={generatedDescription}
                    onSubmit={handleSubmitToBacklog}
                    isSubmitting={isSubmitting}
                  />
                )}
                {step === 'success' && issueResult && (
                  <SuccessPage
                    issueKey={issueResult.issueKey}
                    issueUrl={issueResult.issueUrl}
                    onCreateAnother={handleCreateAnother}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            WebProd Issue Template Agent - WEB制作案件管理システム
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
