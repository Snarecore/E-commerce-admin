export interface FieldDiffItem {
    from: any;
    to: any;
}

export interface FieldDiffChange {
    type: 'FIELD_DIFF';
    changedFields: Record<string, FieldDiffItem>;
}

export interface SnapshotChange {
    type: 'SNAPSHOT';
    before: Record<string, any> | null;
    after: Record<string, any> | null;
}

export interface MutationChange {
    type?: string;
    summary?: string;
    description?: string;
    changedFields?: Record<string, FieldDiffItem>;
    before?: Record<string, any> | null;
    after?: Record<string, any> | null;
    payload?: Record<string, any> | null;
    params?: Record<string, any> | null;
    query?: Record<string, any> | null;
    error?: string | null;
}

export type AuditChange = FieldDiffChange | SnapshotChange | MutationChange | Record<string, any>;

export interface AuditStats {
    total: number;
    today: number;
    successCount: number;
    failedCount: number;
    moduleStats: Array<{ module: string; count: number }>;
    topAdmins: Array<{ name: string; email: string; count: number }>;
}

export interface AuditLogItem {
    id: string;
    actorId: string | null;
    actorName: string | null;
    actorEmail: string | null;
    actorRole: string | null;
    action: string;
    module: string;
    targetId: string | null;
    targetType: string | null;
    httpMethod: string | null;
    route: string | null;
    statusCode: number | null;
    durationMs: number | null;
    ipAddress: string | null;
    userAgent: string | null;
    changes: AuditChange | null;
    status: 'SUCCESS' | 'FAILED';
    createdAt: string;
    updatedAt?: string;
}
