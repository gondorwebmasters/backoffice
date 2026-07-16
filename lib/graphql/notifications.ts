import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      success
      notifications {
        id
        created_at
        type
        message
        link
      }
    }
  }
`;
