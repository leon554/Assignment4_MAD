import { db } from "@/FirebaseConfig";
import { Tables, TeamMember } from "@/types/dbTypes";
import { doc, setDoc } from "firebase/firestore";

export async function createTeamMember(teamMeber: Omit<TeamMember, "memberCode">): Promise<[boolean, string?]>{
    try {
        await setDoc(doc(db, Tables.TeamMember, teamMeber.uid), {
            ...teamMeber,
            memberCode: generateMemberCode()
        })
        return [true]
        
    } catch (error) {
        return [false, (error as Error).message]
    }
}

const generateMemberCode = (): string => {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
};