import { auth, db } from '@/FirebaseConfig';
import { Tables, Team, TeamMember } from '@/types/dbTypes';
import { usePathname, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextType {
    user: User | null;
    member: TeamMember | null;
    team: Team | null;
    loading: boolean;
    refreshMember: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    member: null,
    team: null,
    loading: true,
    refreshMember: () => Promise.resolve()
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [member, setMember] = useState<TeamMember | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const pathName = usePathname()
    const onboardingPaths = ["/login", "/signup"]

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true)
            if (firebaseUser) {
                setUser(firebaseUser);

                const memberSnap = await getDoc(doc(db, Tables.TeamMember, firebaseUser.uid));
                const memberData = memberSnap.data() as TeamMember;
                setMember(memberData);

                if (memberData?.teamId) {
                    const teamSnap = await getDoc(doc(db, Tables.Team, memberData.teamId));
                    setTeam(teamSnap.data() as Team);
                }
                if(onboardingPaths.includes(pathName)){
                    router.replace('/(tabs)')
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

        const memberSnap = await getDoc(doc(db, Tables.TeamMember, user.uid));
        const memberData = memberSnap.data() as TeamMember;
        setMember(memberData);

        if(memberData?.teamId) {
            const teamSnap = await getDoc(doc(db, Tables.Team, memberData.teamId));
            setTeam(teamSnap.data() as Team);
        }else{
            setTeam(null);
        }

        setLoading(false)
    };

    return (
        <UserContext.Provider value={{ user, member, team, loading, refreshMember}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);