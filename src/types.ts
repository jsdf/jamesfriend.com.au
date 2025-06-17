export interface PostData {
  id: string;
  slug: string;
  title: string;
  author: string;
  created: string; // ISO 8601 date string
  published?: boolean;
  // For Schema.org and display
  meta_description?: string;
  // Populated after loading markdown
  body?: React.ReactNode;
  // For display
  created_human?: string;
}

export interface Project {
  url: string;
  tip: string;
  label: string;
}
