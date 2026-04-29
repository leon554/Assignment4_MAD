import { auth, db } from '@/FirebaseConfig';
import { getMembersByCodes, getMemeberFromUID } from '@/services/teamMemberService';
import { Tables, Team, TeamMember } from '@/types/dbTypes';
import { usePathname, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextType {
    user: User | null;
    member: TeamMember | null;
    team: Team | null;
    teamMembers: TeamMember[] | null
    loading: boolean;
    refreshMember: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    member: null,
    team: null,
    teamMembers: null,
    loading: true,
    refreshMember: () => Promise.resolve()
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [member, setMember] = useState<TeamMember | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const pathName = usePathname()
    const onboardingPaths = ["/login", "/signup", "/"]

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true)

            if (firebaseUser) {
                setUser(firebaseUser);
                const memberData = await getMemeberFromUID(firebaseUser.uid)
                setMember(memberData);

                if (memberData?.teamId) {
                    const teamSnap = await getDoc(doc(db, Tables.Team, memberData.teamId));
                    const teamData = teamSnap.data() as Team

                    const teamMembersData = await getMembersByCodes(teamData.memberCodes)

                    setTeam(teamData);
                    setTeamMembers([...teamMembersData])
                }
                if(onboardingPaths.includes(pathName)){
                    if(memberData?.teamId){
                        router.replace('/(tabs)')   
                    }else{
                        router.replace('/(onboarding)/teamformation')
                    }
                }
                
            } else {
                setUser(null);
                setMember(null);
                setTeam(null);
                router.replace('/(onboarding)/signup');
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const refreshMember = async () => {
        if (!user) return;
        setLoading(true)

        const memberData = await getMemeberFromUID(user.uid)
        setMember(memberData);

        if(memberData?.teamId) {
            const teamSnap = await getDoc(doc(db, Tables.Team, memberData.teamId));
            const teamData = teamSnap.data() as Team

            const teamMembersData = await getMembersByCodes(teamData.memberCodes)

            setTeam(teamData);
            setTeamMembers([...teamMembersData])
        }else{
            setTeam(null);
        }

        setLoading(false)
    };

    return (
        <UserContext.Provider value={{ user, member, team, loading, refreshMember, teamMembers}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);