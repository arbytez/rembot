import gql from 'graphql-tag';

const CREATE_USER_MUTATION = gql`
  mutation CREATE_USER_MUTATION($tgid: String!) {
    createUser(data: { tgid: $tgid, roles: { set: GUEST }, state: "main" }) {
      id
      tgid
      roles
      state
    }
  }
`;

const UPDATE_STATE_MUTATION = gql`
  mutation UPDATE_STATE_MUTATION($newState: String!) {
    updateState(newState: $newState) {
      id
      tgid
      roles
      state
    }
  }
`;

const SCHEDULE_REMINDER_MUTATION = gql`
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

const INTERVAL_REMINDER_MUTATION = gql`
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

const REMOVE_REMINDER_MUTATION = gql`
  mutation REMOVE_REMINDER_MUTATION($remId: String!) {
    removeReminder(remId: $remId)
  }
`;

const DISABLE_REMINDER_MUTATION = gql`
  mutation DISABLE_REMINDER_MUTATION($remId: String!) {
    disableReminder(remId: $remId)
  }
`;

const ENABLE_REMINDER_MUTATION = gql`
  mutation ENABLE_REMINDER_MUTATION($remId: String!) {
    enableReminder(remId: $remId)
  }
`;

const DELAYED_INTERVAL_REMINDER_MUTATION = gql`
  mutation DELAYED_INTERVAL_REMINDER_MUTATION(
    $text: String!
    $interval: String!
    $from: String!
  ) {
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

const REQUEST_URL_MUTATION = gql`
  mutation REQUEST_URL_MUTATION {
    requestUrl {
      url
      urlExpiry
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LOGIN_MUTATION($userId: String!, $urlToken: String!) {
    login(userId: $userId, urlToken: $urlToken) {
      id
      tgid
      roles
      state
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation LOGOUT_MUTATION {
    logout
  }
`;

export {
  CREATE_USER_MUTATION,
  UPDATE_STATE_MUTATION,
  SCHEDULE_REMINDER_MUTATION,
  INTERVAL_REMINDER_MUTATION,
  REMOVE_REMINDER_MUTATION,
  DISABLE_REMINDER_MUTATION,
  ENABLE_REMINDER_MUTATION,
  DELAYED_INTERVAL_REMINDER_MUTATION,
  REQUEST_URL_MUTATION,
  LOGIN_MUTATION,
  LOGOUT_MUTATION
};
