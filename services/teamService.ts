import { db } from "@/FirebaseConfig";
import { Tables, Team, TeamMember } from "@/types/dbTypes";
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export async function createTeam(team: Omit<Team, "teamId">): Promise<{success: boolean, message?: string}>{
    const teamId = uuidv4()
    team.memberCodes = team.memberCodes.map(code => code.toUpperCase())

    try {
        const {invalid, alreadyAssigned} = await validateMemberCodes(team.memberCodes)
        if(invalid.length > 0) return {
            success: false, 
            message: "The following member codes are not valid: " + invalid
        }
        if(alreadyAssigned.length > 0) return {
            success: false, 
            message: "The following member codes are allready in a team: " + alreadyAssigned
        }

        await setDoc(doc(db, Tables.Team, teamId), {teamId, ...team})
        const {success, message} = await assignTeamIdToMembers(team.memberCodes, teamId)

        if(!success) throw new Error(message)
        return {success: true}
    } catch (error) {
        return {success: false, message: (error as Error).message}
    }
}

export async function assignTeamIdToMembers(memberCodes: string[], teamId: string): Promise<{success: boolean, message?: string}> {
    try {
        
       if (memberCodes.length === 0) return { success: false, message: 'No members found with those codes' };

        const batch = writeBatch(db);
        memberCodes.forEach(code => {
            batch.update(doc(db, Tables.TeamMember, code), { teamId });
        });
        await batch.commit();

        return {success: true};
    } catch (error) {
        return {success: false, message: (error as Error).message};
    }
}

export async function validateMemberCodes(memberCodes: string[]): Promise<{valid: string[]; invalid: string[]; alreadyAssigned: string[];}> {

    const snap = await Promise.all(
        memberCodes.map(code => getDoc(doc(db, Tables.TeamMember, code)))
    );
    const foundMembers = snap.filter(d => d.exists()).map(d => d.data() as TeamMember);

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

export async function leaveTeam(memberCode: string, teamId: string): Promise<{success: boolean, message?: string}> {
    try {
        const batch = writeBatch(db);

        batch.update(doc(db, Tables.TeamMember, memberCode), { teamId: "" });
        batch.update(doc(db, Tables.Team, teamId), { memberCodes: arrayRemove(memberCode) });

        await batch.commit();

        return {success: true};
    } catch (error) {
        return {success: false, message: (error as Error).message};
    }
}

export async function addMemberToTeam(memberCode: string, teamId: string): Promise<{ success: boolean; message?: string }> {
    const teamRef = doc(db, Tables.Team, teamId);
    const teamMmberRef = doc(db, Tables.TeamMember, memberCode);

    const teamSnap = await getDoc(teamRef)
    const teamMemberSnap = await getDoc(teamMmberRef)

    if (!teamSnap.exists()) return { success: false, message: 'Team not found' };
    if (!teamMemberSnap.exists()) return { success: false, message: 'TeamMember not found' };
   
    await Promise.all([
        updateDoc(teamRef, { memberCodes: arrayUnion(memberCode) }), 
        updateDoc(teamMmberRef, { teamId }),
    ]);

    return { success: true };
}