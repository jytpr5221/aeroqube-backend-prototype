import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    local_path: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    server_url: {
        type: String
    }
});

const translationSchema = new mongoose.Schema({
    appwrite_audio_url: {
        type: String
    },
    article_id: {
        type: String,
        required: true
    },
    author: {
        type: String
    },
    category: {
        type: String
    },
    headline: {
        type: String,
        required: true
    },
    source: {
        type: String
    },
    summary: {
        type: String,
        required: true
    },
    tags: {
        type: [String]
    },
    title: {
        type: String,
        required: true
    },
    tts_file_path: {
        type: String
    }
});

const newsSchema = new mongoose.Schema({
    appwrite_audio_url: {
        type: String
    },
    article_id: {
        type: String,
        required: true,
        unique: true
    },
    author: {
        type: String,
        default: "Unknown Author"
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    headline: {
        type: String,
        required: true
    },
    images: [imageSchema],
    language: {
        type: String,
        required: true
    },
    main_image: imageSchema,
    source: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    time: {
        type: String,
        required: true
    },
    translations: {
        type: Map,
        of: translationSchema
    },
    tts_file_path: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "published"],
        default: "pending"
    },
}, { timestamps: true });

export const News = mongoose.model("News", newsSchema);