import mongoose, { Types } from "mongoose";

const whatsappSEctionSchema = mongoose.Schema({
  number: {
    Type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const WhatsappSection = mongoose.model(
  "WhatsappSection",
  whatsappSEctionSchema,
);

export default WhatsappSection;
