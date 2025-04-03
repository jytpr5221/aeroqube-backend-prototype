import { storage,client } from "../connections/appwrite.connections.js";

export const uploadFileToAppwrite = async (file) => {
    try {
        const upload = await storage.createFile(
            process.env.APPWRITE_AUDIO_BUCKET_ID,
            'unique()',
            file
        );
        // Get the file URL
        const fileUrl = storage.getFileView(
            process.env.APPWRITE_AUDIO_BUCKET_ID,
            upload.$id
        );
        return fileUrl;
    } catch (error) {
        throw new ApiError(500, "Error uploading file to Appwrite");
    }
};