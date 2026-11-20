export type ContentType = 'media' | 'youtube' | 'article' | 'git' | 'page' | 'note'

export interface MemoryInputs {
    title: string;
    description: string;
    tags: string[];
    link: string;
}
