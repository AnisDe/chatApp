import mongoose from "mongoose";



const ImageSchema = new mongoose.Schema({
    url: String,
        filename: String
}); 

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
       required: true,     },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
  ref: "User",
      required: true,
    },
    message: { type: String,},
    images: [ImageSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
