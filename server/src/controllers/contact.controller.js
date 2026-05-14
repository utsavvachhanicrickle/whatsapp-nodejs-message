import {
  getContactByPhoneAndUserId,
  createContact,
  getContactsByUserId,
  deleteContactByIdAndUserId,
  updateContactByIdAndUserId,
  insertManyContacts,
  getContactsByPhonesAndUserId,
  deleteManyContacts,
} from "../services/contact.service.js";
import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";

export const addContectController = async (req, res, next) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.userId || req.user?.id;

    if (!name || !phoneNumber) {
      return next(new AppError(MESSAGES.MISSING_FIELDS, 400));
    }

    const trimmedPhoneNumber = String(phoneNumber).replace(/[\s-]/g, "");

    const existingContact = await getContactByPhoneAndUserId(
      trimmedPhoneNumber,
      userId,
    );

    if (existingContact) {
      return next(new AppError(MESSAGES.CONTACTEXIST, 400));
    }

    const newContact = await createContact(name, trimmedPhoneNumber, userId);

    res.status(200).json({
      success: true,
      message: MESSAGES.ADDCONTACTSUCCESS,
      newContact,
    });
  } catch (error) {
    console.error("added contact error:", error);
    return next(new AppError(MESSAGES.ADDCONTACTERROR, 500));
  }
};

export const getContactController = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;

    const contacts = await getContactsByUserId(userId);

    res.status(200).json({
      success: true,
      message: MESSAGES.GETCONTACTSUCCESS,
      contacts,
    });
  } catch (error) {
    console.error("fetch contact error:", error);
    return next(new AppError(MESSAGES.GETCONTACTERROR, 500));
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?.id;

    const contact = await deleteContactByIdAndUserId(id, userId);

    if (!contact) {
      return next(new AppError(MESSAGES.CONTACTNOTEXIST, 404));
    }

    res.status(200).json({
      success: true,
      message: MESSAGES.DELETECONTACTSUCCESS,
      deletedId: id,
    });
  } catch (error) {
    console.error("delete contact error:", error);
    return next(new AppError(MESSAGES.DELETECONTACTERROR, 500));
  }
};

export const updateContactController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber } = req.body;
    const userId = req.userId || req.user?.id;

    const contact = await updateContactByIdAndUserId(
      id,
      userId,
      name,
      phoneNumber,
    );

    if (!contact) {
      return next(new AppError(MESSAGES.CONTACTNOTEXIST, 404));
    }

    res.status(200).json({
      success: true,
      message: MESSAGES.UPDATECONTACTSUCCESS,
      updatedContact: contact,
    });
  } catch (error) {
    console.error("update contact error error:", error);
    return next(new AppError(MESSAGES.UPDATECONTACTERROR, 500));
  }
};

export const addMultipleContactController = async (req, res, next) => {
  try {
    const contactsArray = req.body.contacts?.contacts || req.body.contacts;
    const userId = req.user?.id || req.userId;

    if (!contactsArray || !Array.isArray(contactsArray)) {
      return next(new AppError("Contacts array is required", 400));
    }

    const validContacts = contactsArray.filter(
      (c) => c.name && c.phoneNumber && /^\d{10}$/.test(c.phoneNumber),
    );

    if (validContacts.length === 0) {
      return next(new AppError("No valid contacts found", 400));
    }

    const validPhoneNumbers = validContacts.map((c) => c.phoneNumber);
    const existing = await getContactsByPhonesAndUserId(
      validPhoneNumbers,
      userId,
    );

    const existingSet = new Set(existing.map((e) => e.phoneNumber));

    const newContacts = validContacts
      .filter((c) => !existingSet.has(c.phoneNumber))
      .map((c) => ({ name: c.name, phoneNumber: c.phoneNumber, userId }));

    const inserted = await insertManyContacts(newContacts);

    return res.status(200).json({
      success: true,
      created: inserted.length,
      duplicates: validContacts.length - newContacts.length,
      failed: contactsArray.length - validContacts.length,
      createdContacts: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return next(new AppError("Bulk upload failed", 500));
  }
};

export const deleteMultipleContactController = async (req, res, next) => {
  try {
    const contactsArray = req.body.contacts;
    const userId = req.user?.id || req.userId;

    if (!contactsArray || !Array.isArray(contactsArray)) {
      return next(new AppError("Contacts array is required", 400));
    }

    const ids = contactsArray.map((c) => c._id || c.id).filter((id) => id);

    if (ids.length === 0) {
      return next(new AppError("No valid contact IDs provided", 400));
    }

    await deleteManyContacts(ids, userId);

    return res.status(200).json({
      success: true,
      message: "Contacts deleted successfully",
      deletedId: ids,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return next(new AppError("Bulk delete failed", 500));
  }
};
