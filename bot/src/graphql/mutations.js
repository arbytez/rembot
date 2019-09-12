exports.CREATE_USER_MUTATION = `
    mutation CREATE_USER_MUTATION($tgid: String!) {
      createUser(data: { tgid: $tgid, roles: { set: GUEST }, state: "main" }) {
        id
        tgid
        roles
        state
    }
  }
`;

exports.UPDATE_STATE_MUTATION = `
    mutation UPDATE_STATE_MUTATION($newState: String!) {
      updateState(newState: $newState) {
        id
        tgid
        roles
        state
    }
  }
`;

exports.SCHEDULE_REMINDER_MUTATION = `
    mutation SCHEDULE_REMINDER_MUTATION($text: String!, $when: String!) {
      scheduleReminder(text: $text, when: $when) {
        id
        to
        text
        nextRunAt
        lastRunAt
        disabled
    }
  }
`;

exports.INTERVAL_REMINDER_MUTATION = `
    mutation INTERVAL_REMINDER_MUTATION($text: String!, $interval: String!) {
      intervalReminder(text: $text, interval: $interval) {
        id
        to
        text
        nextRunAt
        lastRunAt
        disabled
    }
  }
`;

exports.REMOVE_REMINDER_MUTATION = `
    mutation REMOVE_REMINDER_MUTATION($remId: String!) {
    removeReminder(remId: $remId)
  }
`;

exports.DISABLE_REMINDER_MUTATION = `
    mutation DISABLE_REMINDER_MUTATION($remId: String!) {
    disableReminder(remId: $remId)
  }
`;

exports.ENABLE_REMINDER_MUTATION = `
    mutation ENABLE_REMINDER_MUTATION($remId: String!) {
    enableReminder(remId: $remId)
  }
`;

exports.DELAYED_INTERVAL_REMINDER_MUTATION = `
    mutation DELAYED_INTERVAL_REMINDER_MUTATION($text: String!, $interval: String!, $from: String!) {
      delayedIntervalReminder(text: $text, interval: $interval, from: $from) {
        id
        to
        text
        nextRunAt
        lastRunAt
        disabled
      }
  }
`;

exports.REQUEST_URL_MUTATION = `
    mutation REQUEST_URL_MUTATION {
      requestUrl {
        url
        urlExpiry
      }
  }
`;

exports.LOGIN_MUTATION = `
    mutation LOGIN_MUTATION($userId: String!, $urlToken: String!) {
      login(userId: $userId, urlToken: $urlToken) {
        id
        tgid
        roles
        state
    }
  }
`;
