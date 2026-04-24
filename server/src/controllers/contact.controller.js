import Contact from "../modules/contact.module.js";
import { MESSAGES } from "../utils/Messages.js";

export const addContectController = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.userId;

    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.MISSING_FIELDS,
      });
    }

    const trimePhoneNumber = String(phoneNumber).replace(/[\s-]/g, "");

    const existingContact = await Contact.findOne({
      phoneNumber: trimePhoneNumber,
      userId,
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.CONTECTEXIST,
      });
    }

    const newContact = new Contact({
      name,
      phoneNumber: trimePhoneNumber,
      userId,
    });
    await newContact.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.ADDCONTECTSUCCESS,
      newContact,
    });
  } catch (error) {
    console.error("added contact error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ADDCONTECTERROR,
      error: error.message,
    });
  }
};

export const getContectController = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("userId", userId);

    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: MESSAGES.GETCONTECTSUCCESS,
      contacts,
    });
    console.log("fetch called ");
  } catch (error) {
    console.error("fetch contact error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.GETCONTECTERROR,
      error: error.message,
    });
  }
};

export const deleteContectController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const contact = await Contact.findOneAndDelete({ _id: id, userId });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CONTECTNOTEXIST,
      });
    }

    res.status(200).json({
      success: true,
      message: MESSAGES.DELETECONTECTSUCCESS,
      deletedId: id,
    });
  } catch (error) {
    console.error("delete contact error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.DELETECONTECTERROR,
      error: error.message,
    });
  }
};

export const updateContectController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber } = req.body;
    const userId = req.userId;
    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId },
      { name, phoneNumber },
      { new: true },
    );
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CONTECTNOTEXIST,
      });
    }
    res.status(200).json({
      success: true,
      message: MESSAGES.UPDATECONTECTSUCCESS,
      updatedContact: contact,
    });
  } catch (error) {
    console.error("update login error error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.UPDATECONTECTERROR,
      error: error.message,
    });
  }
};
