import { clients } from "../socket.js";
import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";
import { safeClientCall } from "../utils/whatsappUtils.js";

export const messageSendController = async (req, res, next) => {
  try {
    const { sessionId, number, message } = req.body;

    const client = clients[sessionId];

    if (!client) {
      return next(new AppError(MESSAGES.CLIENT_NOT_FOUND, 400));
    }

    if (!client.isReady) {
      return next(new AppError("WhatsApp is still initializing. Please wait a moment.", 400));
    }

    // Smart formatting: ensure number has @c.us and avoid double 91 prefix
    let formatted = number;
    if (!formatted.includes("@c.us")) {
      const digits = formatted.replace(/\D/g, "");
      if (digits.length === 10) {
        formatted = `91${digits}@c.us`;
      } else {
        formatted = `${digits}@c.us`;
      }
    }

    try {
      const result = await safeClientCall(client, 'sendMessage', [formatted, message]);

      // 🔥 Manually save the sent message with canonical ID resolution
      // if (result) {
      //   const { safeClientCall } = await import("../utils/whatsappUtils.js");
        
      //   // Use safeClientCall on the message object itself to handle transient errors
      //   const contact = await safeClientCall(result, 'getContact').catch(() => null);
      //   const chat = await safeClientCall(result, 'getChat').catch(() => null);
        
      //   if (contact && chat) {
      //     let canonicalFrom = contact.id._serialized;
      //     if (canonicalFrom.includes('@lid') && contact.number) {
      //       canonicalFrom = `${contact.number}@c.us`;
      //     }

      //     let canonicalTo = chat.id._serialized;
      //     if (canonicalTo.includes('@lid')) {
      //       const chatContact = await safeClientCall(chat, 'getContact').catch(() => null);
      //       if (chatContact && chatContact.number) {
      //         canonicalTo = `${chatContact.number}@c.us`;
      //       }
      //     }

      //     const { saveMessage } = await import("../services/message.service.js");
      //     await saveMessage({
      //       sessionId,
      //       whatsappId: result.id?._serialized,
      //       from: canonicalFrom,
      //       to: canonicalTo,
      //       body: result.body,
      //       type: result.type,
      //       fromMe: result.fromMe,
      //       timestamp: result.timestamp,
      //     });
      //   }
      // }


      res.json({ success: true, message: result });
    } catch (sendErr) {
      console.error("❌ WhatsApp Send Error:", sendErr.message);
      return next(new AppError("WhatsApp failed to send message. Is the number valid?", 500));
    }

  } catch (err) {
    console.error(err);
    return next(new AppError(MESSAGES.WHATSAPP_MESSAGE_ERROR, 500));
  }
};

export const getMessagesController = async (req, res, next) => {
  try {
    const { sessionId, contactWhatsappId } = req.params;
    const { getMessagesBySessionAndContact } = await import("../services/message.service.js");
    const messages = await getMessagesBySessionAndContact(sessionId, contactWhatsappId);
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

export const getContactsWithMessagesController = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { getContactsWithMessages } = await import("../services/message.service.js");
    const contactIds = await getContactsWithMessages(sessionId);
    res.json({ success: true, contactIds });
  } catch (err) {
    next(err);
  }
};

export const multipleMessageSendController = async (req, res, next) => {
  try {
    const { sessionId, multipleNumber, message } = req.body;

    if (!multipleNumber || !Array.isArray(multipleNumber)) {
      return next(new AppError("multipleNumber not present", 400));
    }

    const client = clients[sessionId];

    if (!client) {
      return next(new AppError(MESSAGES.CLIENT_NOT_FOUND, 400));
    }

    if (!client.isReady) {
      return next(new AppError("WhatsApp is still initializing. Please wait a moment.", 400));
    }

    let success = 0;
    let failed = 0;

    for (const item of multipleNumber) {
      let formatted = item.phoneNumber;
      if (!formatted.includes("@c.us")) {
        const digits = formatted.replace(/\D/g, "");
        if (digits.length === 10) {
          formatted = `91${digits}@c.us`;
        } else {
          formatted = `${digits}@c.us`;
        }
      }

      try {
        const result = await safeClientCall(client, 'sendMessage', [formatted, message]);
        
        // 🔥 Save each sent message with canonical ID resolution
        if (result) {
          const { safeClientCall } = await import("../utils/whatsappUtils.js");
          
          const contact = await safeClientCall(result, 'getContact').catch(() => null);
          const chat = await safeClientCall(result, 'getChat').catch(() => null);

          if (contact && chat) {
            let canonicalFrom = contact.id._serialized;
            if (canonicalFrom.includes('@lid') && contact.number) {
              canonicalFrom = `${contact.number}@c.us`;
            }

            let canonicalTo = chat.id._serialized;
            if (canonicalTo.includes('@lid')) {
              const chatContact = await safeClientCall(chat, 'getContact').catch(() => null);
              if (chatContact && chatContact.number) {
                canonicalTo = `${chatContact.number}@c.us`;
              }
            }

            const { saveMessage } = await import("../services/message.service.js");
            await saveMessage({
              sessionId,
              whatsappId: result.id?._serialized,
              from: canonicalFrom,
              to: canonicalTo,
              body: result.body,
              type: result.type,
              fromMe: result.fromMe,
              timestamp: result.timestamp,
              rawData: result,
            });
          }
        }


        
        success++;
      } catch (err) {

        console.log("❌ Failed:", formatted, err.message);
        failed++;
      }

    }

    return res.status(200).json({
      success: true,
      sent: success,
      failed: failed,
    });

  } catch (error) {
    console.error("Bulk message error:", error.message);
    return next(new AppError(MESSAGES.WHATSAPP_MESSAGE_ERROR, 500));
  }
};
