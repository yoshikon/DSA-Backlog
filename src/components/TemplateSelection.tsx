import { useState, useEffect } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { defaultTemplate } from '../data/defaultTemplate';
import { Section, Item, SelectedItem } from '../types/template';

interface TemplateSelectionProps {
  onGenerate: (selectedItems: SelectedItem[]) => void;
}

export default function TemplateSelection({ onGenerate }: TemplateSelectionProps) {
  const [template] = useState(defaultTemplate);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setExpandedSections(new Set(template.sections.map(s => s.id)));
  }, [template]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const selectAllInSection = (section: Section) => {
    const newSelected = new Map(selectedItems);
    section.items.forEach(item => {
      if (!selectedItems.has(item.id)) {
        newSelected.set(item.id, {
          itemId: item.id,
          sectionId: section.id,
          value: item.type === 'checkbox' ? [] : ''
        });
      }
    });
    setSelectedItems(newSelected);
  };

  const deselectAllInSection = (section: Section) => {
    const newSelected = new Map(selectedItems);
    section.items.forEach(item => {
      newSelected.delete(item.id);
    });
    setSelectedItems(newSelected);
  };

  const isItemSelected = (itemId: string) => selectedItems.has(itemId);

  const toggleItem = (item: Item, sectionId: string) => {
    const newSelected = new Map(selectedItems);
    if (selectedItems.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.set(item.id, {
        itemId: item.id,
        sectionId,
        value: item.type === 'checkbox' ? [] : ''
      });
    }
    setSelectedItems(newSelected);
  };

  const updateItemValue = (itemId: string, value: string | string[]) => {
    const newSelected = new Map(selectedItems);
    const existing = selectedItems.get(itemId);
    if (existing) {
      newSelected.set(itemId, { ...existing, value });
    }
    setSelectedItems(newSelected);
  };

  const validateAndGenerate = () => {
    const validationErrors: string[] = [];

    template.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.required && !selectedItems.has(item.id)) {
          validationErrors.push(`${section.title} - ${item.label} は必須項目です`);
        } else if (item.required && selectedItems.has(item.id)) {
          const value = selectedItems.get(item.id)?.value;
          if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
            validationErrors.push(`${section.title} - ${item.label} に値を入力してください`);
          }
        }
      });
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onGenerate(Array.from(selectedItems.values()));
  };

  const renderItemInput = (item: Item, sectionId: string) => {
    const selected = selectedItems.get(item.id);
    const value = selected?.value || '';

    if (!isItemSelected(item.id)) return null;

    switch (item.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => updateItemValue(item.id, e.target.value)}
            placeholder={item.description}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => updateItemValue(item.id, e.target.value)}
            placeholder={item.description}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => updateItemValue(item.id, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
          >
            <option value="">選択してください</option>
            {item.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {item.options?.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value as string[]).includes(option)}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    updateItemValue(item.id, newValues);
                  }}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );
    }
  };

  const selectedCount = selectedItems.size;
  const totalItems = template.sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">テンプレート選択</h2>
            <p className="text-sm text-slate-600">必要な項目をチェックして値を入力してください</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{selectedCount}</div>
            <div className="text-sm text-slate-600">/ {totalItems} 項目</div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">入力エラー</h3>
            <ul className="space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-700">・ {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {template.sections.map(section => {
          const isExpanded = expandedSections.has(section.id);
          const sectionSelectedCount = section.items.filter(item => isItemSelected(item.id)).length;

          return (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                    <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                    <span className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded">
                      {sectionSelectedCount} / {section.items.length}
                    </span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => selectAllInSection(section)}
                      className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1 hover:bg-slate-100 rounded"
                    >
                      全選択
                    </button>
                    <button
                      onClick={() => deselectAllInSection(section)}
                      className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1 hover:bg-slate-100 rounded"
                    >
                      全解除
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {section.items.map(item => {
                    const selected = isItemSelected(item.id);
                    return (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <button
                            onClick={() => toggleItem(item, section.id)}
                            className="mt-1 flex-shrink-0"
                          >
                            {selected ? (
                              <CheckSquare className="w-5 h-5 text-slate-900" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <label className="font-medium text-slate-900 cursor-pointer">
                                {item.label}
                              </label>
                              {item.required && (
                                <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                  必須
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                        {renderItemInput(item, section.id)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-8 pb-8">
        <button
          onClick={validateAndGenerate}
          disabled={selectedCount === 0}
          className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl hover:bg-slate-800 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
          AIで件名・詳細を生成する
        </button>
      </div>
    </div>
  );
}
