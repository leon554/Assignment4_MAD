// Integration Test
// Tests the submitAttempt and createEmptyAttempt service functions

jest.mock('@/FirebaseConfig', () => ({
    app: {},
    auth: {},
    db: {},
    storage: {},
}));

jest.mock('@/services/teamService', () => ({
    getTeam: jest.fn().mockResolvedValue({ teamName: 'Test Team', teamId: 'team-123' }),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(() => ({})),
    getFirestore: jest.fn(() => ({})),
    setDoc: jest.fn().mockResolvedValue(undefined),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    getDocs: jest.fn().mockResolvedValue({ docs: [] }),
    collection: jest.fn(() => ({})),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(() => ({})),
    ref: jest.fn(() => ({})),
    listAll: jest.fn().mockResolvedValue({ items: [] }),
    deleteObject: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-get-random-values', () => {});
jest.mock('uuid', () => ({ v4: () => 'test-attempt-id-123' }));

import { createEmptyAttempt, submitAttempt } from '@/services/activityAttemptService';

describe('activityAttemptService integration', () => {
    test('createEmptyAttempt returns success with an attemptId', async () => {
        const result = await createEmptyAttempt('1', 'team-123', 'member-abc');
        expect(result.success).toBe(true);
        expect(result.attemptId).toBe('test-attempt-id-123');
    });

    test('submitAttempt returns success when called with valid data', async () => {
        const result = await submitAttempt('test-attempt-id-123', {
            data: {},
            comment: 'Great activity',
            rating: 4,
            score: 80,
        });
        expect(result.success).toBe(true);
    });

    test('createEmptyAttempt sets status to draft', async () => {
        const { setDoc } = require('firebase/firestore');
        setDoc.mockClear();
        await createEmptyAttempt('2', 'team-456', 'member-xyz');
        expect(setDoc).toHaveBeenCalled();
        const callArgs = setDoc.mock.calls[0];
        expect(callArgs[1]).toMatchObject({ status: 'draft' });
    });
});
