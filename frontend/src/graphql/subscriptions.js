import gql from 'graphql-tag';

const REMINDER_COMPLETED_SUBSCRIPTION = gql`
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

export { REMINDER_COMPLETED_SUBSCRIPTION };
