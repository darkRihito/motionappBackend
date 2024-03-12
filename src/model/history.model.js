import mongoose, { Schema } from "mongoose";

const historySchema = mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    score: {
      type: Number,
    },
    point: {
      type: Number,
    },
    result: {
      type: String,
    },
    date_created: {
      type: String,
    }
  },
  { timestamps: true }
);

// Function to format the current date as DD-MM-YYYY
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
historySchema.pre("save", function (next) {
  // Set date_created before saving
  if (!this.date_created) {
    this.date_created = formatDate(new Date());
  }
  next();
});


historySchema.index({ user_id: 1}, { unique: true });

const historyModel = mongoose.model("History", historySchema);

export default historyModel;
