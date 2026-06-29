const Notification = require('../models/Notification');

const sendNotification = async (recipientId, recipientModel, notificationData, io) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientModel: recipientModel,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      link: notificationData.link,
      action: notificationData.action,
      metadata: notificationData.metadata
    });

   
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

const sendBulkNotifications = async (recipients, recipientModel, notificationData, io) => {
  const notifications = [];
  for (const recipient of recipients) {
    const notification = await sendNotification(
      recipient._id || recipient,
      recipientModel,
      notificationData,
      io
    );
    if (notification) notifications.push(notification);
  }
  return notifications;
};

module.exports = { sendNotification, sendBulkNotifications };