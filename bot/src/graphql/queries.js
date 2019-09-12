exports.GET_USER_QUERY = `
    query GET_USER_QUERY($tgid: String!) {
        getUser(tgid: $tgid) {
            id
            tgid
            roles
            state
        }
    }
`;

exports.GET_REMINDERS_QUERY = `
    query GET_REMINDERS_QUERY($skip: Int = 0, $limit: Int = 7) {
        getReminders(skip: $skip, limit: $limit) {
            id
            to
            text
            nextRunAt
            lastRunAt
            disabled
        }
    }
`;

exports.GET_REMINDER_QUERY = `
    query GET_REMINDER_QUERY($remId: String!) {
        getReminder(remId: $remId) {
            id
            to
            text
            nextRunAt
            lastRunAt
            disabled
        }
    }
`;

exports.GET_ALL_REMINDERS_QUERY = `
    query GET_ALL_REMINDERS_QUERY($skip: Int = 0, $limit: Int = 7) {
        getAllReminders(skip: $skip, limit: $limit) {
            id
            to
            text
            nextRunAt
            lastRunAt
            disabled
        }
    }
`;

exports.COUNT_ALL_REMINDERS_QUERY = `
    query COUNT_ALL_REMINDERS_QUERY {
        countAllReminders
    }
`;

exports.COUNT_REMINDERS_QUERY = `
    query COUNT_REMINDERS_QUERY {
        countReminders
    }
`;
