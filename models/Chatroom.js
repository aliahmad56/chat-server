const mongoose = require("mongoose");
const message = require("./Message").schema;
const chatroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    involved_persons: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
      },
    ],
    roomType: {
      type: String,
      enum: ["private", "group", "onlyInvitation"],
      default: "group",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "users",
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,

      ref: "users",
    }],
    //group admin keys
    createdAt: {
      type: Date,
      required: true,
      default: new Date().toUTCString(),
    },
    img_url: {
      type: mongoose.Schema.Types.String,
      default: "https://dummyimage.com/35x35/E4FFDE/A8DC9B.jpg&text=G",
    },
    chat: [{
      type: mongoose.Schema.Types.ObjectId,

      ref: "Message",
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chatroom", chatroomSchema);
