import { useState, useEffect } from 'react';
import { FolderOpen, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BacklogProject {
  id: number;
  projectKey: string;
  name: string;
  archived: boolean;
}

interface ProjectSelectionProps {
  onNext: (projectData: {
    backlogProjectId: string;
    issueType: string;
    priority: string;
    assignee: string;
  }) => void;
}

export default function ProjectSelection({ onNext }: ProjectSelectionProps) {
  const [projects, setProjects] = useState<BacklogProject[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [issueType, setIssueType] = useState('task');
  const [priority, setPriority] = useState('normal');
  const [assignee, setAssignee] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-backlog-projects`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロジェクトの取得に失敗しました');
      }

      const data = await response.json();
      const activeProjects = data.projects.filter((p: BacklogProject) => !p.archived);
      setProjects(activeProjects);

      if (activeProjects.length === 0) {
        setError('利用可能なプロジェクトがありません');
      }
    } catch (err) {
      console.error('プロジェクト読み込みエラー:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Backlog設定を確認してください。設定画面から連携設定を完了してください。'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    onNext({
      backlogProjectId: selectedProject,
      issueType,
      priority,
      assignee
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">プロジェクトを取得できませんでした</h3>
              <p className="text-slate-700 mb-4">{error}</p>
              <button
                onClick={loadProjects}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-100 p-2 rounded-lg">
            <FolderOpen className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">プロジェクト選択</h2>
            <p className="text-sm text-slate-600">課題を作成するプロジェクトを選択してください</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-2">
              プロジェクト <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="">プロジェクトを選択</option>
              {projects.map((project) => (
                <option key={project.id} value={project.projectKey}>
                  {project.name} ({project.projectKey})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-slate-700 mb-2">
                種別
              </label>
              <select
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="task">タスク</option>
                <option value="bug">バグ</option>
                <option value="request">要望</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                優先度
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="normal">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 mb-2">
              担当者ID（任意）
            </label>
            <input
              id="assignee"
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="BacklogユーザーID"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              BacklogのユーザーIDを入力（数値）
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
          >
            次へ進む
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
