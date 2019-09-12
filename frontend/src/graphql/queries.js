import gql from 'graphql-tag';

const ME_QUERY = gql`
  query ME_QUERY {
    me {
      id
      tgid
      roles
      state
    }
  }
`;

const GET_USER_QUERY = gql`
  query GET_USER_QUERY($tgid: String!) {
    getUser(tgid: $tgid) {
      id
      tgid
      roles
      state
    }
  }
`;

const GET_REMINDERS_QUERY = gql`
  query GET_REMINDERS_QUERY($skip: Int = 0, $limit: Int = 7) {
    getReminders(skip: $skip, limit: $limit) {
      id
      to
      text
      nextRunAt
      lastRunAt
      disabled
    }
    countReminders
  }
`;

const GET_REMINDER_QUERY = gql`
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

const GET_ALL_REMINDERS_QUERY = gql`
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

const COUNT_ALL_REMINDERS_QUERY = gql`
  query COUNT_ALL_REMINDERS_QUERY {
    countAllReminders
  }
`;

const COUNT_REMINDERS_QUERY = gql`
  query COUNT_REMINDERS_QUERY {
    countReminders
  }
`;

export {
  ME_QUERY,
  GET_USER_QUERY,
  GET_REMINDERS_QUERY,
  GET_REMINDER_QUERY,
  GET_ALL_REMINDERS_QUERY,
  COUNT_ALL_REMINDERS_QUERY,
  COUNT_REMINDERS_QUERY
};
