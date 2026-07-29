import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      success
      message
      user {
        id
        name
        surname
        email
        nickname
        phoneNumber
        contextRole
        isSuperAdmin
        isActive
        isBlocked
        activeCompanyId
        pictureUrl {
          id
          url
        }
      }
      companies {
        id
        name
      }
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($password: UpdatePasswordInput!) {
    updatePassword(password: $password) {
      success
      message
    }
  }
`;

export const ADMIN_UPDATE_PASSWORD = gql`
  mutation AdminUpdatePassword($password: AdminUpdatePasswordInput!) {
    adminUpdatePassword(password: $password) {
      success
      message
    }
  }
`;

export const SET_ACTIVE_COMPANY = gql`
  mutation SetActiveCompany($companyId: ID!) {
    setActiveCompany(companyId: $companyId) {
      success
      message
      user {
        id
        activeCompanyId
        contextRole
      }
    }
  }
`;
