import { ACTIVITY_DATA } from "@/activityData/activityData";
import { ActivityAttempt, Team } from "@/types/dbTypes";


export function roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function getTeamRanking(team: Team | null, allActivityAttempts: ActivityAttempt[]){
    if (!team) return null;
    
    const activityIds = Object.keys(ACTIVITY_DATA);
    const positions: number[] = [];

    activityIds.forEach((activityId) => {
        const activityAttempts = allActivityAttempts.filter((a) => a.activityId === activityId);
        if (activityAttempts.length === 0) return;

        const highestScorePerTeam: Record<string, number> = {};
        activityAttempts.forEach((a) => {
            highestScorePerTeam[a.teamId] = Math.max((highestScorePerTeam[a.teamId] ?? 0), (a.score ?? 0));
        });

        const ranked = Object.entries(highestScorePerTeam).sort((a, b) => b[1] - a[1]);
        const position = ranked.findIndex(([id]) => id === team.teamId);
        if (position !== -1) positions.push(position + 1);
    });

    if (positions.length === 0) return null;

    const avg = positions.reduce((sum, p) => sum + p, 0) / positions.length;
    const best = Math.min(...positions);
    const worst = Math.max(...positions);

    return { avg: Math.round(avg * 10) / 10, best, worst, activitiesRanked: positions.length };
}

export function getActivitySummaries(team: Team | null, allActivityAttempts: ActivityAttempt[]){
    return Object.keys(ACTIVITY_DATA).map((id) => {
        const acts = allActivityAttempts.filter((a) => a.activityId === id);
        return {
            id,
            title: ACTIVITY_DATA[id].title,
            attempts: acts.filter(a => a.teamId == team?.teamId).length,
            topScore: acts.reduce((max, a) => Math.max(max, a.score ?? 0), 0),
            topTeamScore: acts.filter(a => a.teamId == team?.teamId).reduce((max, a) => Math.max(max, a.score ?? 0), 0)
        };
    });
}

export function isNumberBetweenOneAndFive(value: string): boolean {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1 && num <= 5;
}