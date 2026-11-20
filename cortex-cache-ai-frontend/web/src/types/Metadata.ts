export interface YouTubeSpecificMd {
    video_id: string;
    channel_name: string;
    author_name: string;
    chunk_id: string;
    start_time?: number; // Optional
    end_time?: number; // Optional
}

export interface GitSpecificMd {
    repo_name: string;
    repo_creator_name: string;
    file_name: string;
    programming_language: string;
    chunk_type: string;
    chunk_id: string;
}

export interface MediaSpecificMd {
    type: string;
    chunk_id: string;
    start_time?: number; // Optional
    end_time?: number; // Optional
}

export interface ImageSpecificMd {
    width: number;
    height: number;
    format: string;
    chunk_id: string;
}

export interface TextSpecificMd {
    chunk_id: string;
    url: string;
}

export interface MindMapSpecificMd {
    memory_count: number;
    central_topic: string;
    subtopics: string[];
    chunk_id: string;
}

export interface NoteSpecificMd {
    chunk_id: string;
}
// Main Metadata model that includes common fields and specific metadata

export interface Metadata<T> {
    user_id: string;
    memId: string;
    title: string;
    description: string;
    created_at: string;
    last_updated: string;
    tags: string[];
    source: string;
    language?: string; // Default is "english"
    type: string;
    content_hash?: string; // Optional
    specific_desc: T;
    ai_summary?: string; // Optional
    ai_insights?: string; // Optional
    related_memories?: string[]; // Optional
}

// YouTubeLinkRequest type
export interface YoutubeLinkRequest {
    video_url: string;
    metadata: Metadata<YouTubeSpecificMd>;
}

export interface NoteRequest {
    text: string;
    metadata: Metadata<NoteSpecificMd>;
}

// GitLinkRequest type
export interface GitLinkRequest {
    repo_url: string;
    metadata: Metadata<GitSpecificMd>;
}

// WebLinkRequest type
export interface WebLinkRequest {
    url: string;
    metadata: Metadata<TextSpecificMd>;
}

export interface VideoRequest {
    video_id: string;
    metadata: Metadata<MediaSpecificMd>;
}

// AudioRequest type
export interface AudioRequest {
    audio_id: string;
    metadata: Metadata<MediaSpecificMd>;
}

// ImageRequest type
export interface ImageRequest {
    image_id: string;
    metadata: Metadata<ImageSpecificMd>;
}

// FileRequest type
export interface FileRequest {
    file_id: string;
    metadata: Metadata<MediaSpecificMd>;
}

export type QueueRequestTypes = "youtube" | "git" | "web" | "video" | "audio" | "image" | "file" | "note";

// Discriminated union for QueueRequest
export type QueueRequest<T extends QueueRequestTypes> =
    T extends "youtube"
    ? YoutubeLinkRequest
    : T extends "git"
    ? GitLinkRequest
    : T extends "web"
    ? WebLinkRequest
    : T extends "video"
    ? VideoRequest
    : T extends "audio"
    ? AudioRequest
    : T extends "image"
    ? ImageRequest
    : T extends "file"
    ? FileRequest
    : T extends "note"
    ? NoteRequest
    : never;

export type QueueTask = {
    type: QueueRequestTypes;
    data: unknown;
    retries: number;
}