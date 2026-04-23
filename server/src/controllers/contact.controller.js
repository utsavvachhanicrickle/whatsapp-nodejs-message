import Contact from "../modules/contact.module.js";
import { MESSAGES } from "../utils/Messages.js";

export const addContectController = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.user._id;
    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.MISSING_FIELDS,
      });
    }

    Contact.findOne({ phoneNumber, userId }).then((existingContact) => {
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.CONTECTEXIST,
        });
      }
    });

    const newContact = new Contact({ name, phoneNumber, userId });
    await newContact.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.ADDCONTECTSUCCESS,
      contact: newContact,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ADDCONTECTERROR,
      error: error.message,
    });
  }
};

export const getContectController = async (req, res) => {
  try {
    const userId = req.user._id;
    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: MESSAGES.GETCONTECTSUCCESS,
      contacts,
    });
  } catch (error) {
    console.error("Login error:", error);
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
    const userId = req.user._id;
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
    });
  } catch (error) {
    console.error("Login error:", error);
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
    const userId = req.user._id;
    const contact = await Contact.findOneAndUpdate(
        { _id: id, userId },
        { name, phoneNumber },
        { new: true }
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
        contact,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.UPDATECONTECTERROR,
      error: error.message,
    });
  }
};
