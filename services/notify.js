import Notification from "@/models/Notification";

export async function notify(userId, type, message, link = "/requests") {
  if (!userId) return;
  await Notification.create({ user: userId, type, message, link });
}
