import { auth } from '@/FirebaseConfig';
import { deleteAllDraftAttempts } from '@/services/activityAttemptService';
import { getMembersByCodes, getMemeberFromUID } from '@/services/teamMemberService';
import { getTeam } from '@/services/teamService';
import { Team, TeamMember } from '@/types/dbTypes';
import { usePathname, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextType {
    user: User | null;
    member: TeamMember | null;
    team: Team | null;
    teamMembers: TeamMember[] | null
    loading: boolean;
    refreshMember: () => Promise<void>;
    activityAttemptId: string;
    setActivityAttemptId: (id: string) => void
}

const UserContext = createContext<UserContextType>({
    user: null,
    member: null,
    team: null,
    teamMembers: null,
    loading: true,
    refreshMember: () => Promise.resolve(),
    activityAttemptId: "",
    setActivityAttemptId: () => null
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
    const [activityAttemptId, setActivityAttemptId] = useState("")

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true)

            if (firebaseUser) {
                setUser(firebaseUser);
                const memberData = await getMemeberFromUID(firebaseUser.uid)
                setMember(memberData);

                if (memberData?.teamId) {
                    const teamData = await getTeam(memberData.teamId)

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
                await deleteAllDraftAttempts()
                
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
            const teamData = await getTeam(memberData.teamId)

            const teamMembersData = await getMembersByCodes(teamData.memberCodes)

            setTeam(teamData);
            setTeamMembers([...teamMembersData])
        }else{
            setTeam(null);
        }

        setLoading(false)
    };

    return (
        <UserContext.Provider value={{ user, member, team, loading, refreshMember, teamMembers, activityAttemptId, setActivityAttemptId}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);