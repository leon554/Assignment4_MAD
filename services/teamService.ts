import { db } from "@/FirebaseConfig";
import { Tables, Team } from "@/types/dbTypes";
import { collection, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import 'react-native-get-random-values'; // must be imported first
import { v4 as uuidv4 } from 'uuid';

export async function createTeam(team: Omit<Team, "teamId">): Promise<[boolean, string?]>{
    const teamId = uuidv4()
    try {
        await setDoc(doc(db, Tables.Team, teamId), {teamId, ...team})
        const [succes, error] = await assignMembersToTeam(team.memberIds, teamId)

        if(!succes) throw new Error(error)
        return [true]
    } catch (error) {
        return [false, (error as Error).message]
    }
}

export async function assignMembersToTeam(memberCodes: string[], teamId: string): Promise<[boolean, string?]> {
    try {
        
        const q = query(
            collection(db, Tables.TeamMember),
            where('memberCode', 'in', memberCodes)
        );

        const snap = await getDocs(q);

        if (snap.empty) return [false, 'No members found with those codes'];

        const batch = writeBatch(db);

        snap.docs.forEach((member) => {
            batch.update(doc(db, Tables.TeamMember, member.id), { teamId });
        });

        await batch.commit();

        return [true];
    } catch (error) {
        return [false, (error as Error).message];
    }
}