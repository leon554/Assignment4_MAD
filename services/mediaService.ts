import { db, storage } from "@/FirebaseConfig";
import { AttemptMedia, Tables } from "@/types/dbTypes";
import * as ImagePicker from "expo-image-picker";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
}

export async function captureAndUploadPhoto(attemptId: string): Promise<{ success: boolean; media?: AttemptMedia; message?: string }> {
    try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return { success: false, message: "Camera permission denied" };

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });

        if (result.canceled) return { success: false, message: "Cancelled" };

        const uri = result.assets[0].uri;
        const blob = await uriToBlob(uri);

        const mediaId = uuidv4();
        const storageRef = ref(storage, `media/${attemptId}/${mediaId}.jpg`);

        await uploadBytes(storageRef, blob);
        const mediaUrl = await getDownloadURL(storageRef);

        const media: AttemptMedia = { mediaId, mediaType: "image", mediaUrl };

        await updateDoc(doc(db, Tables.ActivityAttempts, attemptId), {
            media: arrayUnion(media),
        });

        return { success: true, media };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function captureAndUploadVideo(attemptId: string): Promise<{ success: boolean; media?: AttemptMedia; message?: string }> {
    try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return { success: false, message: "Camera permission denied" };

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            videoMaxDuration: 60,
            quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        });

        if (result.canceled) return { success: false, message: "Cancelled" };

        const uri = result.assets[0].uri;
        const blob = await uriToBlob(uri);

        const mediaId = uuidv4();
        const storageRef = ref(storage, `media/${attemptId}/${mediaId}.mp4`);

        await uploadBytes(storageRef, blob);
        const mediaUrl = await getDownloadURL(storageRef);

        const media: AttemptMedia = { mediaId, mediaType: "video", mediaUrl };

        await updateDoc(doc(db, Tables.ActivityAttempts, attemptId), {
            media: arrayUnion(media),
        });

        return { success: true, media };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}