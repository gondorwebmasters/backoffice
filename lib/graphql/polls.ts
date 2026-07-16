import { gql } from "@apollo/client";

export const GET_ADMIN_POLLS = gql`
  query GetAdminPolls {
    getAdminPolls {
      success
      message
      polls {
        id
        created_at
        endDate
        title
        options
        pollVotes {
          optionSelected
          user {
            id
            name
            surname
            nickname
          }
        }
      }
    }
  }
`;

export const CREATE_POLL = gql`
  mutation CreatePoll($poll: CreatePollInput!) {
    createPoll(poll: $poll) {
      success
      message
      poll {
        id
      }
    }
  }
`;

export const REMOVE_POLLS = gql`
  mutation RemovePolls($ids: [String]!) {
    removePolls(ids: $ids) {
      success
      message
    }
  }
`;
