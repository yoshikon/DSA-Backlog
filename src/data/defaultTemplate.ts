import { FullTemplate } from '../types/template';

export const defaultTemplate: FullTemplate = {
  version: '2025-10-07',
  name: 'WEB制作案件 標準テンプレート',
  sections: [
    {
      id: 'company-basic',
      title: '会社・案件基本',
      items: [
        {
          id: 'project-name',
          label: '案件名',
          description: '案件の正式名称を入力してください',
          required: true,
          type: 'text',
          cfMappingKey: 'customField_6680'
        },
        {
          id: 'client-name',
          label: 'クライアント名',
          description: '発注元の会社名を入力してください',
          required: true,
          type: 'text'
        },
        {
          id: 'business-overview',
          label: '事業概要',
          description: 'クライアントの事業内容を記載してください',
          type: 'textarea'
        },
        {
          id: 'team-structure',
          label: '担当体制',
          description: 'ディレクター、デザイナー、エンジニアなど',
          type: 'textarea'
        },
        {
          id: 'target-launch-date',
          label: '希望公開日',
          description: 'YYYY-MM-DD形式で入力してください',
          type: 'text'
        },
        {
          id: 'budget-range',
          label: '予算レンジ',
          type: 'select',
          options: ['200-500万円', '500-1000万円', '1000万円以上', '未定']
        }
      ]
    },
    {
      id: 'site-purpose',
      title: 'サイト目的・戦略',
      items: [
        {
          id: 'site-objective',
          label: 'サイト目的',
          required: true,
          type: 'select',
          options: ['リード獲得', '採用強化', 'ブランディング', 'EC売上向上', '複合目的']
        },
        {
          id: 'kpi',
          label: 'KPI',
          description: '具体的な目標数値や指標を記載してください',
          type: 'textarea'
        },
        {
          id: 'target-audience',
          label: 'ターゲット',
          description: 'ペルソナや想定ユーザーを記載してください',
          type: 'textarea'
        },
        {
          id: 'competitor-sites',
          label: '競合・参考サイトURL',
          description: '1行に1URLを記載してください',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'content-structure',
      title: 'コンテンツ構成',
      items: [
        {
          id: 'page-list',
          label: 'ページ一覧',
          description: '各ページを改行区切りで記載してください',
          required: true,
          type: 'textarea'
        },
        {
          id: 'main-flow',
          label: '主要導線',
          description: 'ユーザーが辿る想定導線を記載してください',
          type: 'textarea'
        },
        {
          id: 'required-content',
          label: '必須コンテンツ',
          type: 'checkbox',
          options: ['会社概要', 'サービス紹介', '事例・実績', 'ブログ', '採用情報', '問い合わせフォーム']
        },
        {
          id: 'article-policy',
          label: '記事運用方針',
          description: '更新頻度や記事の種類など',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'design-requirements',
      title: 'デザイン要件',
      items: [
        {
          id: 'tone-manner',
          label: 'トーン＆マナー',
          type: 'select',
          options: ['シンプル・洗練', '信頼・堅実', '高級・プレミアム', 'ポップ・親しみ', 'モダン・先進']
        },
        {
          id: 'color-spec',
          label: 'カラー指定',
          description: 'コーポレートカラーや希望カラーコード',
          type: 'text'
        },
        {
          id: 'ng-expression',
          label: 'NG表現',
          description: '避けるべき表現やデザイン',
          type: 'textarea'
        },
        {
          id: 'reference-design-url',
          label: '参考デザインURL',
          description: 'Figmaやデザイン参考サイト',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'spec-function',
      title: '仕様・機能',
      items: [
        {
          id: 'cms-usage',
          label: 'CMS利用',
          type: 'select',
          options: ['WordPress', 'Headless CMS', 'microCMS', '不要']
        },
        {
          id: 'required-functions',
          label: '必須機能',
          type: 'checkbox',
          options: ['問い合わせフォーム', 'サイト内検索', 'ブログ機能', '会員機能', 'EC機能', '多言語対応']
        },
        {
          id: 'form-fields',
          label: 'フォーム項目定義',
          description: '問い合わせフォームの項目を記載してください',
          type: 'textarea'
        },
        {
          id: 'seo-requirements',
          label: 'SEO要件',
          description: '対策キーワードや特記事項',
          type: 'textarea'
        },
        {
          id: 'analytics-tags',
          label: 'アナリティクス/タグ',
          description: 'GA4、GTMなど導入するツール',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'assets-rights',
      title: '素材・権利',
      items: [
        {
          id: 'logo',
          label: 'ロゴ',
          type: 'select',
          options: ['支給あり', '制作依頼', '既存流用']
        },
        {
          id: 'photos',
          label: '写真',
          type: 'select',
          options: ['支給あり', '撮影手配', '素材購入', 'フリー素材使用']
        },
        {
          id: 'text-content',
          label: 'テキスト',
          type: 'select',
          options: ['支給あり', 'ライティング依頼', '既存流用']
        },
        {
          id: 'copyright-credit',
          label: '著作権/クレジット表記',
          description: '権利関係の特記事項',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'environment-infra',
      title: '環境・インフラ',
      items: [
        {
          id: 'domain',
          label: 'ドメイン',
          description: '使用するドメイン名',
          type: 'text'
        },
        {
          id: 'server',
          label: 'サーバ',
          type: 'select',
          options: ['既存サーバ利用', '新規サーバ契約', 'クラウド（AWS/GCP等）', '未定']
        },
        {
          id: 'git-repository-url',
          label: 'Gitリポジトリ URL',
          description: 'GitHubやGitLabなどのリポジトリURL',
          type: 'text'
        },
        {
          id: 'ftp-info',
          label: 'FTP情報',
          description: 'FTPホスト、ユーザー名、接続方法などの情報',
          type: 'textarea'
        },
        {
          id: 'security',
          label: 'セキュリティ',
          description: 'SSL、WAF、脆弱性対策など',
          type: 'textarea'
        },
        {
          id: 'backup-dr',
          label: 'バックアップ/DR',
          description: 'データバックアップ要件',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'operation-maintenance',
      title: '運用・保守',
      items: [
        {
          id: 'update-structure',
          label: '更新体制',
          type: 'select',
          options: ['クライアント自身', '当社運用代行', '共同運用']
        },
        {
          id: 'update-frequency',
          label: '更新頻度',
          description: '想定される更新頻度',
          type: 'text'
        },
        {
          id: 'maintenance-scope',
          label: '保守範囲',
          description: '保守契約の範囲や内容',
          type: 'textarea'
        },
        {
          id: 'sla-monitoring',
          label: 'SLA/監視',
          description: 'サービスレベルや監視要件',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'schedule',
      title: 'スケジュール',
      items: [
        {
          id: 'phase-plan',
          label: 'フェーズ計画',
          description: '要件定義、設計、開発、テストなどの期間',
          type: 'textarea'
        },
        {
          id: 'milestones',
          label: 'マイルストーン',
          description: '重要な中間成果物や納期',
          type: 'textarea'
        },
        {
          id: 'risks-dependencies',
          label: 'リスク/依存関係',
          description: '懸念事項や外部依存',
          type: 'textarea'
        }
      ]
    },
    {
      id: 'references',
      title: '参照・添付',
      items: [
        {
          id: 'figma-spec-url',
          label: 'Figma/仕様URL',
          description: 'デザインや仕様書のURL',
          type: 'text'
        },
        {
          id: 'existing-site-url',
          label: '既存サイトURL',
          description: 'リニューアルの場合は現行サイト',
          type: 'text'
        },
        {
          id: 'other-references',
          label: 'その他参照',
          description: '参考資料やドキュメントへのリンク',
          type: 'textarea'
        }
      ]
    }
  ]
};
