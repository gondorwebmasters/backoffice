import { gql } from "@apollo/client";

/**
 * Envío de notificaciones push (Expo) 1 a muchos. `userIds` dirige el envío
 * a una selección concreta de miembros — es la misma primitiva que ya usa
 * el server para notificaciones individuales, extendida para aceptar una
 * lista de destinatarios en vez de un único usuario implícito.
 */
export const SEND_NOTIFICATION = gql`
  mutation SendNotification($notification: SendNotificationInput!) {
    sendNotification(notification: $notification) {
      success
      message
    }
  }
`;
