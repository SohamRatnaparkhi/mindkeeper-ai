import { QueueRequest } from "@/types/Metadata";

export const getYoutubeProcessingRequest = (topic: string, link: string, userId: string, title: string, desc: string, tags: string[], language = 'english'): QueueRequest<"youtube"> => {
    return {
        "video_url": link,
        "metadata": {
            "user_id": userId,
            "memId": "",
            "title": title,
            "description": desc,
            "created_at": "",
            "last_updated": "",
            "tags": tags,
            "source": "youtube",
            "language": language,
            "type": "youtube",
            "content_hash": "",
            "specific_desc": {
                "video_id": "",
                "channel_name": "",
                "author_name": "",
                "chunk_id": ""
            },
            "ai_summary": "",
            "ai_insights": "",
            "related_memories": [
                ""
            ]
        }
    }
}

export const getGitProcessingRequest = (
    topic: string,
    repoUrl: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"git"> => {
    return {
        repo_url: repoUrl,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "github",
            language: language,
            type: "git",
            content_hash: "",
            specific_desc: {
                repo_name: "",
                repo_creator_name: "",
                file_name: "",
                programming_language: "",
                chunk_type: "",
                chunk_id: ""
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    };
};

export const getWebProcessingRequest = (
    topic: string,
    url: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"web"> => {
    return {
        url: url,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "web",
            language: language,
            type: "web",
            content_hash: "",
            specific_desc: {
                chunk_id: "",
                url: url
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    };
};

export const getVideoProcessingRequest = (
    topic: string,
    videoId: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"video"> => {
    return {
        video_id: videoId,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "local",
            language: language,
            type: "video",
            content_hash: "",
            specific_desc: {
                type: "",
                chunk_id: "",
                start_time: 0,
                end_time: 120
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    };
};

export const getAudioProcessingRequest = (
    topic: string,
    audioId: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"audio"> => {
    return {
        audio_id: audioId,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "local",
            language: language,
            type: "audio",
            content_hash: "",
            specific_desc: {
                type: "",
                chunk_id: "",
                start_time: 0,
                end_time: 3600
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    };
};

export const getImageProcessingRequest = (
    topic: string,
    imageId: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"image"> => {
    return {
        image_id: imageId,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "local",
            language: language,
            type: "image",
            content_hash: "",
            specific_desc: {
                width: 1024,
                height: 768,
                format: "jpeg",
                chunk_id: ""
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    };
};

export const getFileProcessingRequest = (
    topic: string,
    fileId: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"file"> => {
    return {
        file_id: fileId,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "local",
            language: language,
            type: "file",
            content_hash: "",
            specific_desc: {
                type: "pdf",
                chunk_id: ""
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    };
};

export const getNoteProcessingRequest = (
    topic: string,
    text: string,
    userId: string,
    title: string,
    desc: string,
    tags: string[],
    language = 'english'
): QueueRequest<"note"> => {
    return {
        text: text,
        metadata: {
            user_id: userId,
            memId: "",
            title: title,
            description: desc,
            created_at: "",
            last_updated: "",
            tags: tags,
            source: "local",
            language: language,
            type: "note",
            content_hash: "",
            specific_desc: {
                chunk_id: ""
            },
            ai_summary: "",
            ai_insights: "",
            related_memories: [""]
        }
    }
}
