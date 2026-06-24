export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export interface TemplateInput {
  name: string;
  content: string;
}
