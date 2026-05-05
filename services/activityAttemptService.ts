import { db } from "@/FirebaseConfig";
import { ActivityAttempt, activityAttemptData, Tables } from "@/types/dbTypes";
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { deleteObject, getStorage, listAll, ref } from "firebase/storage";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getTeam } from "./teamService";
 

//-----Pipeline for activity attempts----
// 1. use createEmptyAttempt to create an empty attempt which will return a attemptId which can be stored in the user
//contex for global acces
// 2. use submitAttempt, captureAndUploadPhoto and/or captureAndUploadVideo to add data
//    to the attempt using the attemptId
//--------------------------------------

export async function createEmptyAttempt(activityId: string,teamId: string,submittedByUserCode: string): Promise<{ success: boolean; attemptId?: string; message?: string }> {
    try {
        const attemptId = uuidv4();
        const team = await getTeam(teamId)
 
        const attempt: Partial<ActivityAttempt> = {
            attemptId,
            activityId,
            teamId,
            teamName: team.teamName,
            submittedBy: submittedByUserCode,
            date: new Date(),
            media: [],
            status: "draft",
        };
 
        await setDoc(doc(db, Tables.ActivityAttempts, attemptId), attempt);
 
        return { success: true, attemptId };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
 
export async function submitAttempt(attemptId: string, attemptData: activityAttemptData): Promise<{ success: boolean; message?: string }> {
    try {
        await updateDoc(doc(db, Tables.ActivityAttempts, attemptId), {
            ...attemptData,
            status: "submitted",
        });
 
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
 
export async function discardAttempt(attemptId: string): Promise<{ success: boolean; message?: string }> {
    try {
        await deleteAllAttemptMedia(attemptId);
        await deleteDoc(doc(db, Tables.ActivityAttempts, attemptId));
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
 
export async function getActivityAttemptsForTeam(teamId: string): Promise<ActivityAttempt[]> {
    const q = query(
        collection(db, Tables.ActivityAttempts),
        where('teamId', '==', teamId),
        where('status', '==', 'submitted')
    );
 
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ActivityAttempt);
}
 
export async function getActivityAttemptsForActivity(activityId: string): Promise<ActivityAttempt[]> {
    const q = query(
        collection(db, Tables.ActivityAttempts),
        where('activityId', '==', activityId),
        where('status', '==', 'submitted')
    );
 
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ActivityAttempt);
}

export async function deleteAllAttemptMedia(attemptId: string): Promise<{ success: boolean; message?: string }> {
    try {
        const storage = getStorage();
        const folderRef = ref(storage, `media/${attemptId}`);

        const files = await listAll(folderRef);
        await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));

        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
export async function deleteAllDraftAttempts(): Promise<{ success: boolean; deletedCount?: number; message?: string }> {
    try {
        const q = query(
            collection(db, Tables.ActivityAttempts),
            where('status', '==', 'draft')
        );

        const snap = await getDocs(q);

        await Promise.all(
            snap.docs.map(d => discardAttempt(d.id))
        );

        return { success: true, deletedCount: snap.docs.length };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}