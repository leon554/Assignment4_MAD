// End to End Test
// Tests the full activity attempt flow from create to submit

jest.mock('@/FirebaseConfig', () => ({
    app: {},
    auth: {},
    db: {},
    storage: {},
}));

jest.mock('@/services/teamService', () => ({
    getTeam: jest.fn().mockResolvedValue({ teamName: 'Test Team', teamId: 'team-e2e' }),
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
jest.mock('uuid', () => ({ v4: () => 'e2e-attempt-id-456' }));

import { createEmptyAttempt, discardAttempt, submitAttempt } from '@/services/activityAttemptService';

describe('Full activity attempt flow', () => {
    test('user can create, submit and the attempt succeeds end to end', async () => {
        const createResult = await createEmptyAttempt('1', 'team-e2e', 'member-e2e');
        expect(createResult.success).toBe(true);
        expect(createResult.attemptId).toBeDefined();

        const submitResult = await submitAttempt(createResult.attemptId!, {
            data: {},
            comment: 'Parachute worked well',
            rating: 5,
            score: 95,
        });
        expect(submitResult.success).toBe(true);
    });

    test('user can discard an attempt and it gets deleted', async () => {
        const createResult = await createEmptyAttempt('2', 'team-e2e', 'member-e2e');
        expect(createResult.success).toBe(true);

        const discardResult = await discardAttempt(createResult.attemptId!);
        expect(discardResult.success).toBe(true);
    });

    test('submit attempt with invalid score of 0 still saves successfully', async () => {
        const createResult = await createEmptyAttempt('3', 'team-e2e', 'member-e2e');
        const submitResult = await submitAttempt(createResult.attemptId!, {
            data: {},
            comment: '',
            rating: 1,
            score: 0,
        });
        expect(submitResult.success).toBe(true);
    });
});
