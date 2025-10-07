import { useState, useEffect } from 'react';
import { Settings, FileText, Database, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'templates' | 'projects' | 'audit'>('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'templates') {
        const { data } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });
        setTemplates(data || []);
      } else if (activeTab === 'projects') {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .order('name');
        setProjects(data || []);
      } else if (activeTab === 'audit') {
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setAuditLogs(data || []);
      }
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'templates' as const, label: 'テンプレート管理', icon: FileText },
    { id: 'projects' as const, label: 'プロジェクト管理', icon: Database },
    { id: 'audit' as const, label: '監査ログ', icon: Activity }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">管理パネル</h2>
              <p className="text-sm text-slate-600">システム設定と監査ログの確認</p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-600">読み込み中...</div>
          ) : (
            <>
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      登録テンプレート一覧
                    </h3>
                  </div>
                  {templates.length === 0 ? (
                    <div className="text-center py-12 text-slate-600">
                      テンプレートがありません
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{template.name}</h4>
                                {template.is_active && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    有効
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">
                                バージョン: {template.version}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                作成日: {new Date(template.created_at).toLocaleString('ja-JP')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      プロジェクト一覧
                    </h3>
                  </div>
                  {projects.length === 0 ? (
                    <div className="text-center py-12 text-slate-600">
                      プロジェクトがありません
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projects.map(project => (
                        <div
                          key={project.id}
                          className="border border-slate-200 rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-slate-900 mb-1">
                            {project.name}
                          </h4>
                          <p className="text-sm text-slate-600">
                            プロジェクトID: {project.backlog_project_id}
                          </p>
                          <p className="text-sm text-slate-600">
                            スペース: {project.space}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    最近の操作ログ
                  </h3>
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-600">
                      ログがありません
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs.map(log => (
                        <div
                          key={log.id}
                          className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">
                              {log.action === 'create_issue' && '課題作成'}
                              {log.action === 'generate_content' && 'AI生成'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(log.created_at).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          {log.details && (
                            <div className="text-xs text-slate-600 bg-slate-50 rounded p-2 font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
