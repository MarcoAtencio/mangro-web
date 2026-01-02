import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a profile image for a specific user.
 * @param file The file object to upload
 * @param userId The ID of the user (used for naming the file)
 * @returns The download URL of the uploaded image
 */
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
    // Create a reference to 'profiles/{userId}'
    // We append the timestamp to avoid caching issues if the user updates the photo
    // or just use the userId if we want to overwrite.
    // Let's use userId + extension to be safe with types, or just userId.

    // Extract extension or default to nothing (browser handles mime type usually)
    const extension = file.name.split('.').pop();
    const fileName = `${userId}.${extension}`;
    const storageRef = ref(storage, `profiles/${fileName}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
    }
}
