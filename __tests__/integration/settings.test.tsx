// Integration test for the Settings screen — verifies the "Leave Team" flow
// wires the UI, UserContext, and teamService together correctly.

import Settings from '@/app/(tabs)/settings';
import { useUser } from '@/context/UserContext';
import { leaveTeam } from '@/services/teamService';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

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

describe('Settings screen: Leave Team integration', () => {
    const mockRefreshMember = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        alertSpy.mockClear();
    });

    test('1. Leave Team happy path: calls service, refreshes member, shows success alert', async () => {
        (useUser as jest.Mock).mockReturnValue({
            member: { memberCode: '125XH', teamId: 'team-abc' },
            team: { teamId: 'team-abc', teamName: 'Red Team' },
            refreshMember: mockRefreshMember,
        });

        (leaveTeam as jest.Mock).mockResolvedValue({
            success: true,
            message: 'Left team',
        });

        render(<Settings />);

        expect(screen.getByText('Team Name: Red Team')).toBeTruthy();

        fireEvent.press(screen.getByText('Leave Team'));

        await waitFor(() => {
            expect(leaveTeam).toHaveBeenCalledWith('125XH', 'team-abc');
        });

        expect(mockRefreshMember).toHaveBeenCalledTimes(1);

        expect(alertSpy).toHaveBeenCalledWith('Successfully left team');
    });

    test('2. Leave Team when user has no team: short-circuits without calling the service', async () => {
        (useUser as jest.Mock).mockReturnValue({
            member: { memberCode: 'MEM-456', teamId: null },
            team: null,
            refreshMember: mockRefreshMember,
        });

        render(<Settings />);

        expect(screen.getByText('Team Name: Not In Team')).toBeTruthy();

        fireEvent.press(screen.getByText('Leave Team'));

        expect(alertSpy).toHaveBeenCalledWith('You are allready not in a team');

        expect(leaveTeam).not.toHaveBeenCalled();

        expect(mockRefreshMember).not.toHaveBeenCalled();
    });
});