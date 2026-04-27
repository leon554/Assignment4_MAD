import { db } from "@/FirebaseConfig";
import { Tables, TeamMember } from "@/types/dbTypes";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

export async function createTeamMember(teamMeber: Omit<TeamMember, "memberCode">): Promise<[boolean, string?]>{
    try {
        const memberCode =  generateMemberCode();
        await setDoc(doc(db, Tables.TeamMember, memberCode), {
            ...teamMeber,
            memberCode
        })
        return [true]
        
    } catch (error) {
        return [false, (error as Error).message]
    }
}

const generateMemberCode = (): string => {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
};

export async function getMemeberFromUID(uid: string){
    const q = query(
        collection(db, Tables.TeamMember),
        where('uid', '==', uid)
    );

    const memberSnap = await getDocs(q);
    if (memberSnap.empty) throw new Error('Member not found');

    return memberSnap.docs[0].data() as TeamMember;
}