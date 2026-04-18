
export const Tables = {
    TeamMember: 'TeamMember',
    Team: 'Team',
    Activity: 'Activity',
    ActivityAttempts: 'ActivityAttempt',
}

export interface TeamMember {
    uid: string;
    name: string;
    teamId: string;
    memberCode: string;
}

export interface Team {
    teamId: string;
    teamName: string;
    gradeLevel: number;
    memberIds: string[];
}

export interface Activity {
    activityId: string;
    name: string;
}

export interface AttemptMedia {
    mediaId: string;
    mediaType: string;
    mediaUrl: string;
}

export interface ActivityAttempt {
    attemptId: string;
    activityId: string;
    teamId: string;
    submittedBy: string;
    data: Record<string, unknown>;
    date: Date;
    comment: string;
    rating: number;
    score: number;
    media: AttemptMedia[];
}