exports.REMINDER_COMPLETED_SUBSCRIPTION = `
    subscription REMINDER_COMPLETED_SUBSCRIPTION {
        reminderCompleted {
            id
            to
            text
            nextRunAt
            lastRunAt
            disabled
        }
    }
`;
