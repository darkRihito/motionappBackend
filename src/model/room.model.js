import mongoose, { Schema } from "mongoose";

const roomSchema = mongoose.Schema({
  room_name: {
    type: String,
    required: [true, "Room name is required"],
  },
  list_user: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  room_code: {
    type: String,
    unique: true,
  },
});

roomSchema.index({ room_code: 1 }, { unique: true });

const roomModel = mongoose.model("Room", roomSchema);
export default roomModel;