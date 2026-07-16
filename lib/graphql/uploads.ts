import { gql } from "@apollo/client";

export const GET_PRESIGNED_URL = gql`
  query GetPresignedUrl($key: String, $command: String) {
    getPresignedUrl(key: $key, command: $command) {
      success
      message
      presignedUrl
      key
    }
  }
`;
