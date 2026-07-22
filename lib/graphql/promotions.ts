import { gql } from "@apollo/client";

export const PROMOTION_FIELDS = gql`
  fragment PromotionFields on Promotion {
    id
    title
    description
    discountTag
    originalPrice
    newPrice
    expiresAt
    accentColor
    isHero
    isActive
  }
`;

export const LIST_PROMOTIONS = gql`
  ${PROMOTION_FIELDS}
  query ListPromotions($includeInactive: Boolean) {
    getCompanyPromotions(includeInactive: $includeInactive) {
      success
      message
      promotions {
        ...PromotionFields
      }
    }
  }
`;

export const CREATE_PROMOTION = gql`
  ${PROMOTION_FIELDS}
  mutation CreatePromotion($promotion: CreatePromotionInput!) {
    createPromotion(promotion: $promotion) {
      success
      message
      promotion {
        ...PromotionFields
      }
    }
  }
`;

export const UPDATE_PROMOTION = gql`
  ${PROMOTION_FIELDS}
  mutation UpdatePromotion($id: ID!, $promotion: UpdatePromotionInput!) {
    updatePromotion(id: $id, promotion: $promotion) {
      success
      message
      promotion {
        ...PromotionFields
      }
    }
  }
`;

export const DELETE_PROMOTION = gql`
  mutation DeletePromotion($id: ID!) {
    deletePromotion(id: $id) {
      success
      message
    }
  }
`;
