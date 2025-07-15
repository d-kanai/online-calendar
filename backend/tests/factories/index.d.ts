export declare const meetingFactory: {
    create: (data: any) => Promise<{
        id: string;
        title: string;
        startTime: Date;
        endTime: Date;
        isImportant: boolean;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
