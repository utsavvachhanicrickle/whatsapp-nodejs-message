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

export const addMultipleContectController = async (req, res) => {
  try {
    const { contacts } = req.body.contacts;
    const userId = req.user?.id || req.userId;
    // console.log(contacts);

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: "Contacts array is required",
      });
    }

    // ✅ Validate format
    const validContacts = contacts.filter(
      (c) => c.name && c.phoneNumber && /^\d{10}$/.test(c.phoneNumber),
    );

    if (validContacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid contacts found",
      });
    }

    // ✅ Remove duplicates (DB)
    const existing = await Contact.find({
      phoneNumber: { $in: validContacts.map((c) => c.phoneNumber) },
      userId,
    }).select("phoneNumber");

    const existingSet = new Set(existing.map((e) => e.phoneNumber));

    const newContacts = validContacts.filter(
      (c) => !existingSet.has(c.phoneNumber),
    );

    const inserted = await Contact.insertMany(
      newContacts.map((c) => ({ ...c, userId })),
      { ordered: false },
    );

    return res.status(200).json({
      success: true,
      created: inserted.length,
      duplicates: validContacts.length - newContacts.length,
      failed: contacts.length - validContacts.length,
      createdContacts: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
    });
  }
};

export const deleteMultipleContactController = async (req, res) => {
  try {
    const { contacts } = req.body.contacts;
    console.log("delete Contact Called");

    const userId = req.user?.id || req.userId;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: "Contacts array is required",
      });
    }

    const ids = contacts.map((c) => c._id);

    const result = await Contact.deleteMany({
      _id: { $in: ids },
      userId: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Contacts deleted successfully",
      deletedId: ids,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Bulk delete failed",
    });
  }
};
