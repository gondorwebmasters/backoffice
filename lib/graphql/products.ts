import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      success
      message
      products {
        id
        name
        description
        price
        pictures {
          id
          url
        }
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: CreateProductInput!) {
    createProduct(product: $product) {
      success
      message
      product {
        id
        name
        description
        price
      }
    }
  }
`;

export const REMOVE_PRODUCT = gql`
  mutation RemoveProduct($ids: [String]!) {
    removeProduct(ids: $ids) {
      success
      message
    }
  }
`;
