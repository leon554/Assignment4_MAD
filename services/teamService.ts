import { db } from "@/FirebaseConfig";
import { Tables, Team, TeamMember } from "@/types/dbTypes";
import { arrayRemove, collection, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import 'react-native-get-random-values'; // must be imported first
import { v4 as uuidv4 } from 'uuid';

export async function createTeam(team: Omit<Team, "teamId">): Promise<{success: boolean, message?: string}>{
    const teamId = uuidv4()
    team.memberIds = team.memberIds.map(code => code.toUpperCase())

    try {
        const {invalid, alreadyAssigned} = await validateMemberCodes(team.memberIds)
        if(invalid.length > 0) return {
            success: false, 
            message: "The following member codes are not valid: " + invalid
        }
        if(alreadyAssigned.length > 0) return {
            success: false, 
            message: "The following member codes are allready in a team: " + alreadyAssigned
        }

        await setDoc(doc(db, Tables.Team, teamId), {teamId, ...team})
        const {success, message} = await assignTeamIdToMembers(team.memberIds, teamId)

        if(!success) throw new Error(message)
        return {success: true}
    } catch (error) {
        return {success: false, message: (error as Error).message}
    }
}

export async function assignTeamIdToMembers(memberCodes: string[], teamId: string): Promise<{success: boolean, message?: string}> {
    try {
        
        const q = query(
            collection(db, Tables.TeamMember),
            where('memberCode', 'in', memberCodes)
        );

        const snap = await getDocs(q);

        if (snap.empty) return {success: false, message: 'No members found with those codes'};

        const batch = writeBatch(db);

        snap.docs.forEach((member) => {
            batch.update(doc(db, Tables.TeamMember, member.id), { teamId });
        });

        await batch.commit();

        return {success: true};
    } catch (error) {
        return {success: false, message: (error as Error).message};
    }
}

export async function validateMemberCodes(memberCodes: string[]): Promise<{
    valid: string[];
    invalid: string[];
    alreadyAssigned: string[];
}> {
    const q = query(
        collection(db, Tables.TeamMember),
        where('memberCode', 'in', memberCodes)
    );

    const snap = await getDocs(q);
    const foundMembers = snap.docs.map(d => d.data() as TeamMember);

    const valid = foundMembers
        .filter(m => !m.teamId)
        .map(m => m.memberCode);

    const alreadyAssigned = foundMembers
        .filter(m => m.teamId)
        .map(m => m.memberCode);

    const invalid = memberCodes.filter(
        code => !foundMembers.some(m => m.memberCode === code)
    );

    return { valid, invalid, alreadyAssigned };
}

export async function leaveTeam(uid: string, teamId: string): Promise<{success: boolean, message?: string}> {
    try {
        const batch = writeBatch(db);

        batch.update(doc(db, Tables.TeamMember, uid), {
            teamId: ""
        });

        batch.update(doc(db, Tables.Team, teamId), {
            memberIds: arrayRemove(uid)
        });

        await batch.commit();

        return {success: true};
    } catch (error) {
        return {success: false, message: (error as Error).message};
    }
}