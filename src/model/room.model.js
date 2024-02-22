import mongoose, { Schema } from "mongoose";

const spaceRegesPattern = /\s/;

const roomSchema = mongoose.Schema({
  room_name: {
    type: String,
    required: [true, "Room name is required"],
    // maxLength: [20, "Room name must be less than 20 characters"],
    // validate: {
    //   validator: function (value) {
    //     return !spaceRegesPattern.test(value);
    //   },
    //   message: "Room name must not contain spaces",
    // },
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

roomSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  const count = await roomModel.countDocuments();
  this.room_code = `R${(count + 1).toString().padStart(3, "0")}`;
  next();
});

const roomModel = mongoose.model("Room", roomSchema);
export default roomModel;
