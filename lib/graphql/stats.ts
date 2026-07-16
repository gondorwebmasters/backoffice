import { gql } from "@apollo/client";

export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    getAdminStats {
      success
      message
      stats {
        users {
          totalUsers
          notActiveUsers
          blockedUsers
          newUsers
          pendingUsers
        }
        schedules
        polls
        plans
        subscriptions
        transactions
        notifications
      }
    }
  }
`;

export const GET_SCHEDULES_STATS = gql`
  query GetSchedulesStats($month: Int!) {
    getSchedulesStats(month: $month) {
      success
      message
      stats {
        dayAndTime
        ratio
      }
    }
  }
`;

export const GET_SUBSCRIPTIONS_STATS = gql`
  query GetSubscriptionsStats {
    getSubscriptionsStats {
      success
      message
      stats {
        planId
        planName
        count
      }
    }
  }
`;

export const GET_GLOBAL_SYSTEM_STATS = gql`
  query GetGlobalSystemStats {
    getGlobalSystemStats {
      success
      message
      totalUsers
      totalCompanies
    }
  }
`;
