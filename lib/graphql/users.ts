import { gql } from "@apollo/client";

export const USER_LIST_FIELDS = gql`
  fragment UserListFields on User {
    id
    name
    surname
    email
    nickname
    phoneNumber
    isActive
    isBlocked
    isVerified
    isPending
    contextRole
    subscription
    pictureUrl {
      id
      url
    }
  }
`;

export const GET_USERS = gql`
  ${USER_LIST_FIELDS}
  query GetUsers(
    $query: String
    $page: Int
    $roleFilter: [UserRoleEnum]
    $stateFilter: String
    $planFilter: PlanFilterInput
  ) {
    getUsers(
      query: $query
      page: $page
      roleFilter: $roleFilter
      stateFilter: $stateFilter
      filterMe: true
      planFilter: $planFilter
    ) {
      success
      message
      users {
        ...UserListFields
      }
    }
  }
`;

export const FIND_USER = gql`
  ${USER_LIST_FIELDS}
  query FindUser($id: ID!) {
    findUser(id: $id) {
      success
      message
      user {
        ...UserListFields
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
      success
      message
      user {
        id
      }
    }
  }
`;

export const UPDATE_USER = gql`
  ${USER_LIST_FIELDS}
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      success
      message
      user {
        ...UserListFields
      }
    }
  }
`;

export const UPDATE_USER_PICTURE = gql`
  mutation UpdateUserPicture($picture: String!, $userId: String!) {
    updateUserPicture(picture: $picture, userId: $userId) {
      success
      message
      user {
        id
        pictureUrl {
          id
          url
        }
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const ADMIT_USER_TO_COMPANY = gql`
  mutation AdmitUserToCompany($companyId: ID!, $userId: ID!, $role: UserRoleEnum) {
    admitUserToCompany(companyId: $companyId, userId: $userId, role: $role) {
      success
      message
    }
  }
`;
