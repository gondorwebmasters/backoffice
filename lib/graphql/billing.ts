import { gql } from "@apollo/client";

export const INVOICE_FIELDS = gql`
  fragment InvoiceFields on Invoice {
    id
    created_at
    invoiceNumber
    status
    total
    amountPaid
    amountRemaining
    currency
    dueDate
    paidAt
    description
    isPaid
    isOverdue
    formattedTotal
    user {
      id
      name
      surname
      nickname
      email
    }
  }
`;

export const GET_OVERDUE_INVOICES = gql`
  ${INVOICE_FIELDS}
  query GetOverdueInvoices {
    getOverdueInvoices {
      success
      message
      invoices {
        ...InvoiceFields
      }
    }
  }
`;

export const LIST_USER_INVOICES = gql`
  ${INVOICE_FIELDS}
  query ListUserInvoices($userId: ID!) {
    listUserInvoices(userId: $userId) {
      success
      message
      invoices {
        ...InvoiceFields
      }
    }
  }
`;

export const VOID_INVOICE = gql`
  ${INVOICE_FIELDS}
  mutation VoidInvoice($invoiceId: ID!) {
    voidInvoice(invoiceId: $invoiceId) {
      success
      message
      invoice {
        ...InvoiceFields
      }
    }
  }
`;

export const MARK_INVOICE_UNCOLLECTIBLE = gql`
  ${INVOICE_FIELDS}
  mutation MarkInvoiceAsUncollectible($invoiceId: ID!) {
    markInvoiceAsUncollectible(invoiceId: $invoiceId) {
      success
      message
      invoice {
        ...InvoiceFields
      }
    }
  }
`;

export const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on Transaction {
    id
    created_at
    externalTransactionId
    type
    status
    amount
    amountRefunded
    currency
    description
    failureReason
  }
`;

export const LIST_USER_TRANSACTIONS = gql`
  ${TRANSACTION_FIELDS}
  query ListUserTransactions($userId: ID!, $limit: Int) {
    listUserTransactions(userId: $userId, limit: $limit) {
      success
      message
      transactions {
        ...TransactionFields
      }
    }
  }
`;

export const REFUND_TRANSACTION = gql`
  ${TRANSACTION_FIELDS}
  mutation RefundTransaction($input: RefundTransactionInput!) {
    refundTransaction(input: $input) {
      success
      message
      transaction {
        ...TransactionFields
      }
    }
  }
`;

export const RETRY_FAILED_TRANSACTION = gql`
  ${TRANSACTION_FIELDS}
  mutation RetryFailedTransaction($transactionId: ID!) {
    retryFailedTransaction(transactionId: $transactionId) {
      success
      message
      transaction {
        ...TransactionFields
      }
    }
  }
`;
