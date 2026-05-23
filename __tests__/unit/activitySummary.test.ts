import { ActivityAttempt, Team } from "@/types/dbTypes";
import { getActivitySummaries } from "@/util/util";

describe('Activity Summaries', () => {
    const team: Team = {
        teamId: "2267a390-030b-4702-8961-c036a1d9b9c2",
        teamName: "test123",
        gradeLevel: 4,
        memberCodes: ["LOPXSB"],
    }
    const activityAttempts: ActivityAttempt[] = [
        {
            attemptId: "0daae9c4-e7b1-4d0d-bb74-46f0248a4457",
            activityId: "6",
            teamId: team.teamId,
            teamName: team.teamName,
            submittedBy: team.memberCodes[0],
            data: {},
            date: new Date(),
            comment: "comment",
            rating: 5,
            score: 4875,
            media: [],
            status: "submitted"
        },
        {
            attemptId: "434963-8ad6-471d-a6e4-17f3c07d0b6a",
            activityId: "6",
            teamId: "c4820963-8ad6-471d-a6e4-17f3c07d0b6a",
            teamName: "team2",
            submittedBy: "BDPXSB",
            data: {},
            date: new Date(),
            comment: "comment",
            rating: 5,
            score: 7875,
            media: [],
            status: "submitted"
        }
    ]

    test('returns correct summary for activity 6', () => {
        expect(getActivitySummaries(team, activityAttempts)[5]).toEqual({   
                id: "6",
                title: "Reaction Board Challenge",
                attempts: 1,
                topScore: 7875,
                topTeamScore: 4875,
        });
    });
});