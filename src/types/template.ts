export type ItemType = 'text' | 'textarea' | 'select' | 'checkbox';

export interface Item {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  type: ItemType;
  options?: string[];
  allowAutoComplete?: boolean;
  cfMappingKey?: string;
}

export interface Section {
  id: string;
  title: string;
  items: Item[];
}

export interface FullTemplate {
  version: string;
  name: string;
  sections: Section[];
}

export interface SelectedItem {
  itemId: string;
  sectionId: string;
  value: string | string[];
}

export interface GeneratedContent {
  summary: string;
  description: string;
}

export interface BacklogIssue {
  issueKey: string;
  url: string;
}
