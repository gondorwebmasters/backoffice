import { gql } from "@apollo/client";

export interface PaymentConnectionStatus {
  isConnected: boolean;
  accountId?: string | null;
  status?: string | null;
  connectedAt?: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  missingRequirements?: (string | null)[] | null;
  disabledReason?: string | null;
}

export const GET_PAYMENT_CONNECTION_STATUS = gql`
  query GetPaymentConnectionStatus($companyId: ID!) {
    getPaymentConnectionStatus(companyId: $companyId) {
      success
      message
      status {
        isConnected
        accountId
        status
        connectedAt
        chargesEnabled
        payoutsEnabled
        missingRequirements
        disabledReason
      }
    }
  }
`;

export const GET_PAYMENT_ONBOARDING_URL = gql`
  mutation GetPaymentOnboardingUrl($companyId: ID!, $platform: String) {
    getPaymentOnboardingUrl(companyId: $companyId, platform: $platform) {
      success
      message
      url
    }
  }
`;

export const DISCONNECT_PAYMENT_ACCOUNT = gql`
  mutation DisconnectPaymentAccount($companyId: ID!) {
    disconnectPaymentAccount(companyId: $companyId) {
      success
      message
      status {
        isConnected
      }
    }
  }
`;
