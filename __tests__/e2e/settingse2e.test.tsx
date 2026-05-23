// E2E test: full Settings team-management workflow:
// user views their team, leaves it, sees state update, then is prevented from leaving again.

import Settings from '@/app/(tabs)/settings';
import { useUser } from '@/context/UserContext';
import { leaveTeam } from '@/services/teamService';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/FirebaseConfig', () => ({
    auth: { signOut: jest.fn() },
}));

jest.mock('@/services/teamService', () => ({
    leaveTeam: jest.fn(),
}));

jest.mock('@/context/UserContext', () => ({
    useUser: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const alertSpy = jest.fn();
(global as any).alert = alertSpy;

describe('Settings screen: full team management workflow (E2E)', () => {
    test('user views team, leaves it, state updates, second leave attempt is blocked', async () => {
        let userState = {
            member: { memberCode: 'XYHDGL', teamId: 'team-blue' },
            team: { teamId: 'team-blue', teamName: 'Blue Team' },
        };

        const refreshMember = jest.fn().mockImplementation(async () => {
            userState = {
                member: { memberCode: 'XYHDGL', teamId: null as any },
                team: null as any,
            };
        });

        (useUser as jest.Mock).mockImplementation(() => ({
            ...userState,
            refreshMember,
        }));

        (leaveTeam as jest.Mock).mockResolvedValue({ success: true, message: 'OK' });

        const { rerender } = render(<Settings />);

        expect(screen.getByText('Team Name: Blue Team')).toBeTruthy();

        await act(async () => {
            fireEvent.press(screen.getByText('Leave Team'));
        });

        await waitFor(() => {
            expect(leaveTeam).toHaveBeenCalledWith('XYHDGL', 'team-blue');
            expect(refreshMember).toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalledWith('Successfully left team');
        });

        rerender(<Settings />);
        expect(screen.getByText('Team Name: Not In Team')).toBeTruthy();

        (leaveTeam as jest.Mock).mockClear();
        alertSpy.mockClear();

        fireEvent.press(screen.getByText('Leave Team'));

        expect(alertSpy).toHaveBeenCalledWith('You are allready not in a team');
        expect(leaveTeam).not.toHaveBeenCalled();
    });
});