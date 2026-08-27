import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

export const expo = new Expo();

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  const validMessages = messages.filter((msg) => {
    if (typeof msg.to === "string") {
      return Expo.isExpoPushToken(msg.to);
    }
    if (Array.isArray(msg.to)) {
      return msg.to.every((t) => Expo.isExpoPushToken(t));
    }
    return false;
  });

  if (validMessages.length === 0) {
    return [];
  }

  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("❌ Erro ao enviar chunk de push notifications:", error);
    }
  }

  return tickets;
}
