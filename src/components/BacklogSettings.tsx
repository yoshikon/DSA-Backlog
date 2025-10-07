import { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BacklogSettingsData {
  space_name: string;
  api_key: string;
  default_project_id: string;
  is_connected: boolean;
  last_verified_at: string | null;
}

export default function BacklogSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BacklogSettingsData>({
    space_name: '',
    api_key: '',
    default_project_id: '',
    is_connected: false,
    last_verified_at: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('backlog_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          space_name: data.space_name,
          api_key: data.api_key,
          default_project_id: data.default_project_id || '',
          is_connected: data.is_connected,
          last_verified_at: data.last_verified_at
        });
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyConnection = async () => {
    if (!settings.space_name || !settings.api_key) {
      setMessage({ type: 'error', text: 'スペース名とAPIキーを入力してください' });
      return false;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-backlog-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            space_name: settings.space_name,
            api_key: settings.api_key
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '接続検証に失敗しました');
      }

      setMessage({ type: 'success', text: 'Backlog接続が確認されました' });
      return true;
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Backlog接続に失敗しました。スペース名とAPIキーを確認してください。'
      });
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const isValid = await verifyConnection();
    if (!isValid) return;

    setSaving(true);

    try {
      const { data: existing } = await supabase
        .from('backlog_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const settingsData = {
        user_id: user.id,
        space_name: settings.space_name,
        api_key: settings.api_key,
        default_project_id: settings.default_project_id || null,
        is_connected: true,
        last_verified_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase
          .from('backlog_settings')
          .update(settingsData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('backlog_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'update_backlog_settings',
        resource_type: 'settings',
        details: {
          space_name: settings.space_name,
          has_api_key: !!settings.api_key
        }
      });

      setSettings(prev => ({
        ...prev,
        is_connected: true,
        last_verified_at: new Date().toISOString()
      }));

      setMessage({ type: 'success', text: 'Backlog設定を保存しました' });
    } catch (error) {
      console.error('保存エラー:', error);
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-100 p-2 rounded-lg">
          <LinkIcon className="w-6 h-6 text-slate-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Backlog連携設定</h2>
          <p className="text-sm text-slate-600">BacklogのAPIキーとスペース情報を設定してください</p>
        </div>
      </div>

      {settings.is_connected && settings.last_verified_at && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Backlogと連携済み</p>
            <p className="text-xs text-green-700 mt-1">
              最終確認: {new Date(settings.last_verified_at).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className={`border rounded-lg p-4 mb-6 flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-900' : 'text-red-900'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="space-name" className="block text-sm font-medium text-slate-700 mb-2">
            スペース名 <span className="text-red-500">*</span>
          </label>
          <input
            id="space-name"
            type="text"
            value={settings.space_name}
            onChange={(e) => setSettings({ ...settings, space_name: e.target.value })}
            placeholder="your-space"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            例: your-space.backlog.jp の場合は「your-space」を入力
          </p>
        </div>

        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 mb-2">
            APIキー <span className="text-red-500">*</span>
          </label>
          <input
            id="api-key"
            type="password"
            value={settings.api_key}
            onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
            placeholder="Backlog APIキーを入力"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            Backlogの「個人設定」→「API」から取得できます
          </p>
        </div>

        <div>
          <label htmlFor="project-id" className="block text-sm font-medium text-slate-700 mb-2">
            デフォルトプロジェクトID（任意）
          </label>
          <input
            id="project-id"
            type="text"
            value={settings.default_project_id}
            onChange={(e) => setSettings({ ...settings, default_project_id: e.target.value })}
            placeholder="WEBPROD"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            よく使用するプロジェクトのIDを設定できます
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={verifyConnection}
            disabled={verifying || !settings.space_name || !settings.api_key}
            className="flex-1 bg-white text-slate-900 py-3 px-6 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                接続確認中...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                接続テスト
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || verifying || !settings.space_name || !settings.api_key}
            className="flex-1 bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                保存
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">APIキーの取得方法</h3>
        <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
          <li>Backlogにログインします</li>
          <li>右上のユーザーアイコンから「個人設定」を選択</li>
          <li>左メニューから「API」を選択</li>
          <li>「登録」ボタンをクリックしてAPIキーを生成</li>
          <li>生成されたAPIキーをコピーして上記に入力</li>
        </ol>
      </div>
    </div>
  );
}
