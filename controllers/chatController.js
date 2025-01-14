const { mongo } = require("mongoose");
const mongoose = require("../handlers/connectionHandler");
const chatroom = require("../models/Chatroom");
const privateChatroom = require("../models/privateChatroom");
const users = require("../models/User");
const organization = require("../models/organization");
const message = require("../models/Message");
const SupportMessage = require("../models/SupportMessage");
const arraysort = require("sort-object");
const { ObjectId } = require("mongodb");
const requestChatRoom = require("../models/requestChatRoom");
const privacySetting = require("../models/privacySetting");
const requestModel = require("../models/requestModel");
const supportChatroom = require("../models/supportChatroom");
const adminModel = require("../models/adminModel");
const customerSupportModel = require("../models/customerSupportModel");
const contactsModel = require("../models/contactsModel");

const userModel = require("../models/User")

async function createPrivateChat(req, res, next) {
  try {
    console.log(req.body.receiverId);
    console.log("req.userId", req.userId);

    // return;
    if (!req.userId || !req.body.receiverId)
      return res.status(500).json({
        message: "you maybe missing receiver  ",
        code: "1000",
        success: false,
      });
    let data = await chatroom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
            userB: mongo.ObjectID(req.body.receiverId),
          },
          {
            userB: mongo.ObjectID(req.userId),
            userA: mongo.ObjectID(req.body.receiverId),
          },
        ],
        roomType: "private",
      })
      // .then((data) => {
      //   if (data) {
      //     return res.status(200).json({
      //       success: false,
      //       code: 1110,
      //       message: "already exists",
      //       data: data,
      //     });
      //   }
      // })
      .catch((err) => {
        res.send(err);
      });
    if (data)
      return res.status(200).json({
        success: false,
        code: 1110,
        message: "already exists",
        data: data,
        roomid: data._id,
      });

    let newRoom = new chatroom({
      userA: req.userId,
      userB: req.body.receiverId,
      chat: [],
      roomType: "private",
    });

    await newRoom.save();
    res.status(200).send({
      message: "privateChat created",
      code: 1000,
      success: true,
      roomid: newRoom._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function createRequestPrivateChat(req, res, next) {
  try {
    if (!req.body.userId || !req.body.receiverId)
      return res.status(500).json({
        message: "you maybe missing email receiver  ",
        code: "1000",
        success: false,
      });
    let data = await requestChatRoom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.body.userId),
            userB: mongo.ObjectID(req.body.receiverId),
          },
          {
            userB: mongo.ObjectID(req.body.userId),
            userA: mongo.ObjectID(req.body.receiverId),
          },
        ],
        requestId: req.body.requestId,
      })
      // .then((data) => {
      //   if (data) {
      //     return res.status(200).json({
      //       success: false,
      //       code: 1110,
      //       message: "already exists",
      //       data: data,
      //     });
      //   }
      // })
      .catch((err) => {
        res.send(err);
      });
    if (data)
      return res.status(200).json({
        success: false,
        code: 1110,
        message: "already exists",
        data: data,
      });
    const userId = await users.findOne({ _id: ObjectId(req.body.userId) });
    const receiverId = await users.findOne({
      _id: ObjectId(req.body.receiverId),
    });
    console.log("userId ", userId);
    console.log("receiverId ", receiverId);
    if (userId?.role) {
      let newRoom = new requestChatRoom({
        userA: req.body.receiverId,
        userB: req.body.userId,
        requestId: req.body.requestId,
        chat: [],
      });

      await newRoom.save();
      res.status(200).send({
        message: "requestprivateChat created",
        code: 1000,
        success: true,
        roomid: newRoom._id,
      });
    } else if (receiverId.role) {
      let newRoom = new requestChatRoom({
        userA: req.body.userId,
        userB: req.body.receiverId,
        requestId: req.body.requestId,
        chat: [],
      });

      await newRoom.save();
      res.status(200).send({
        message: "requestprivateChat created",
        code: 1000,
        success: true,
        roomid: newRoom._id,
      });
    } else {
      let newRoom = new requestChatRoom({
        userA: req.body.userId,
        userB: req.body.receiverId,
        requestId: req.body.requestId,
        chat: [],
      });

      await newRoom.save();
      res.status(200).send({
        message: "requestprivateChat created",
        code: 1000,
        success: true,
        roomid: newRoom._id,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function savePrivateChat(req, res, next) {
  try {
    //we should recieve senderId instead email. we should recieve receiverID instead of reciever email
    if (!req.body.userId || !req.body.receiverId || !req.body.message)
      return res.status(500).json({
        message: "you maybe missing sender reciever or message",
        code: "1000",
        success: false,
      });

    let newMessage = new message({
      user: req.body.userId,
      message: req.body.message,
    });
    //it should have OR condition for updateOne condition
    /*
    await privateChatroom.updateOne(
  {
    $or: [{
      userA: req.body.userId,
      userB: req.body.receiverId,
    }, //should be id1 
    {
      userA: req.body.receiverId,
      userB: req.body.userId,
    } //should be id2
    ]
  },
  {      
    $push: { comments: comment }
  }
).catch((err) => { console.log(err); });*/

    await privateChatroom
      .updateOne(
        {
          userA: req.body.userId,
          userB: req.body.receiverId,
        },
        {
          $push: {
            chat: newMessage,
          },
        }
      )
      .then((data) => {
        if (data.nModified > 0) {
          res.status(200).json({
            message: "message sent",
            chatMessage: newMessage,
            code: "1000",
            success: true,
          });
        } else {
          res.status(200).json({
            message: "message not sent",
            code: "1000",
            success: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "message not sent",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1001",
      success: false,
    });
  }
}
async function getPrivateChat(req, res, next) {
  try {
    if (!req.userId || !req.query.receiverId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
            userB: mongo.ObjectID(req.query.receiverId),
          },
          {
            userB: mongo.ObjectID(req.userId),
            userA: mongo.ObjectID(req.query.receiverId),
          },
        ],
        roomType: "private",
      })
      .populate("userA")
      .populate("userB")
      .populate("chat")
      .populate("chat.user")
      .then(async (data) => {
        if (!data || !data._id) {
          let userA = await users.findById({ _id: req.userId });
          let userB = await users.findById({ _id: req.query.receiverId });

          return res.status(200).json({
            chat: [],
            _id: "",
            initiated: false,
            userA,
            userB,
          });
        } else {
          console.log("data ", data);
          if (data?.userA?._id == req.userId) {
            // Overwriting system name with contact's name
            //   ifContact = await contactsModel.findOne({ userId: req.userId, phoneNo: data?.userB?.phoneNo });
            //   if (ifContact) {
            //     data.userB.name = ifContact?.name
            //   }
            // } else {
            //   // Overwriting system name with contact's name
            //   ifContact = await contactsModel.findOne({ userId: req.userId, phoneNo: data?.userA?.phoneNo });
            //   if (ifContact) {
            //     data.userA.name = ifContact?.name
            //   }
          }
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getRequestPrivateChat(req, res, next) {
  try {
    console.log("req.query ", req.query);
    if (!req.query.userId || !req.query.receiverId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await requestChatRoom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.query.userId),
            userB: mongo.ObjectID(req.query.receiverId),
            requestId: req.query.requestId,
          },
          {
            userB: mongo.ObjectID(req.query.userId),
            userA: mongo.ObjectID(req.query.receiverId),
            requestId: req.query.requestId,
          },
        ],
      })
      .populate("userA")
      .populate("userB")
      .populate("chat.user")
      .then(async (data) => {
        if (!data || !data._id) {
          let userA = await users.findById({ _id: req.query.userId });
          let userB = await users.findById({ _id: req.query.receiverId });

          return res.status(200).json({
            chat: [],
            _id: "",
            initiated: false,
            userA,
            userB,
          });
        } else {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}

async function getAllPrivateChat(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(400).json({
        message: "Missing user ID",
        code: "1000",
        success: false,
      });
    }
    console.log("user id is", req.userId)
    const userdetails = await users.findById(req.userId)
    console.log("user details are", userdetails)
    
    // return;

    // Convert userId to ObjectId
    // const userId = mongoose.Types.ObjectId(req.userId);

    const userId = mongo.ObjectId(req.userId);
    console.log("User ID:", userId);

    const chatRooms = await chatroom
    .find({
      $or: [{ userA: userId }, { userB: userId }],
      roomType: "private",
    }).populate({
      path: "userA userB",
      select: "name email", // Adjust the fields as needed
    });

    // .populate("userA userB", "name") // Only populate 'name' field
    // .select("-chat"); // Exclude chat array from results
  
  
  console.log("Populated Chat Rooms:", chatRooms);

    return res.status(200).json({
      success: true,
      message: "Private chats found",
      chatRoomLists: chatRooms,
    });
  } catch (err) {
    console.error("Error in getAllPrivateChat:", err);
    return res.status(500).json({
      message: "Oops! Something went wrong.",
      code: "1002",
      success: false,
    });
  }
}

const deleteChatRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        message: "Chat room ID is required",
        code: "1003",
        success: false,
      });
    }

    // Fetch the chat room
    const chatRoom = await chatroom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        message: "Chat room not found",
        code: "1004",
        success: false,
      });
    }

    // Extract message IDs from the chat array in the chat room
    const messageIds = chatRoom.chat;

    if (messageIds && messageIds.length > 0) {
      // Delete messages in the message collection using the IDs
      await message.deleteMany({ _id: { $in: messageIds } });
    }

    // Delete the chat room itself
    await chatroom.findByIdAndDelete(roomId);

    return res.status(200).json({
      message: "Chat room and associated messages deleted successfully",
      code: "1005",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An error occurred while deleting the chat room",
      code: "1006",
      success: false,
    });
  }
};

// User send message to him self as according to chat flow. for this if user search
// his own name thier chatRoom history in api response
async function searchPrivateChatRoom(req, res, next) {
  try {
    const { query } = req.query; // Search query from the client

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
        code: "1007",
        success: false,
      });
    }

    console.log("Search query:", query);

    // Find chat rooms where the names of userA or userB match the search query
    const chatRooms = await chatroom.find({
      roomType: "private",
    }).populate({
      path: "userA userB",
      select: "name email", // Populate name and email for userA and userB
      match: {
        name: { $regex: query, $options: "i" }, // Case-insensitive match for name
      },
    });

    // Filter out chat rooms where both userA and userB are null after population
    const filteredChatRooms = chatRooms.filter(
      (room) => room.userA || room.userB
    );

    console.log("Filtered Chat Rooms:", filteredChatRooms);

    return res.status(200).json({
      success: true,
      message: "Search results found",
      chatRoomLists: filteredChatRooms,
    });
  } catch (err) {
    console.error("Error in searchPrivateChats:", err);
    return res.status(500).json({
      message: "Oops! Something went wrong.",
      code: "1008",
      success: false,
    });
  }
}


async function searchAllPrivateChat(req, res, next) {
  try {
    const { searchQuery } = req.params;
    if (!req.userId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });
    // const searchContacts = await contactsModel.find({
    //   userId: req.userId,
    //   $or: [
    //     {
    //       // Search the 'name' field with a case-insensitive regex
    //       name: { $regex: searchQuery, $options: "i" },
    //     },
    //   ],
    //   contactUserId: { $exists: true }
    // })
    //   .select('contactUserId')
    // console.log("searchContacts ", searchContacts)
    // const searchContactsIds = searchContacts.map(contact => contact.contactUserId);
    // console.log("searchContactsIds", searchContactsIds);
    await privateChatroom
      .find({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
            userB: { $in: searchContactsIds },
          },
          {
            userA: { $in: searchContactsIds },
            userB: mongo.ObjectID(req.userId),
          },
        ],
      })
      .populate("userA userB")
      .select("-chat")

      .then(async (data) => {
        const promises = data.map(async (element) => {
          if (element.userA._id == req.userId) {
            element.userA = element.userB;
            element.userB = null;
          }
          // Overwriting system name with contact's name
          // ifContact = await contactsModel.findOne({ userId: req.userId, phoneNo: element.userA.phoneNo });
          // if (ifContact) {
          //   element.userA.name = ifContact?.name
          // }
          return element;
        });

        // Wait for all promises to resolve
        const updatedData = await Promise.all(promises);

        // Now, `updatedData` contains the modified elements with user names

        return res.status(200).send({
          success: true,
          message: "Private chats found",
          privateChats: updatedData,
        });
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function onReadChat(req, res, next) {
  try {
    const { requestId, userId } = req.body;
    const user = await users.findOne({ _id: ObjectId(userId) });
    console.log("user ", user);
    if (user.role) {
      await requestModel.updateOne(
        { _id: requestId },
        {
          $set: {
            isProviderRead: true,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Read Operation Performed",
      });
    } else {
      await requestModel.updateOne(
        { _id: requestId },
        {
          $set: {
            isCustomerRead: true,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Read Operation Performed",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function createSupportChat(req, res, next) {
  try {
    if (!req.body.userId || !req.body.supportId)
      return res.status(500).json({
        message: "you maybe missing email receiver  ",
        code: "1000",
        success: false,
      });
    let data = await supportChatroom
      .findOne({
        $or: [
          {
            user: mongo.ObjectID(req.body.userId),
            supportId: mongo.ObjectID(req.body.supportId),
          },
        ],
      })
      // .then((data) => {
      //   if (data) {
      //     return res.status(200).json({
      //       success: false,
      //       code: 1110,
      //       message: "already exists",
      //       data: data,
      //     });
      //   }
      // })
      .catch((err) => {
        res.send(err);
      });
    if (data)
      return res.status(200).json({
        success: false,
        code: 1110,
        message: "already exists",
        data: data,
      });
    const question = await customerSupportModel.findOne({
      _id: ObjectId(req.body.supportId),
    });
    const chatInitiated = await customerSupportModel.updateOne(
      { _id: req.body.supportId },
      {
        $set: {
          isChatInitiated: true,
        },
      }
    );
    var newMessage = new SupportMessage({
      user: question.customerSupportBy,
      message: question.customerSupportTitle,
    });
    var newMessage2 = new SupportMessage({
      user: question.customerSupportBy,
      message: question.customerSupportDescription,
    });
    let newRoom = new supportChatroom({
      user: req.body.userId,
      supportId: req.body.supportId,
      chat: [newMessage, newMessage2],
    });

    await newRoom.save();
    res.status(200).send({
      message: "supportChat created",
      code: 1000,
      success: true,
      roomid: newRoom._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getSupportChat(req, res, next) {
  try {
    console.log("req.query", req.query);
    if (!req.query.userId || !req.query.supportId)
      return res.status(500).json({
        message: "you maybe missing userId or supportId ",
        code: "1000",
        success: false,
      });

    await supportChatroom
      .findOne({
        $or: [
          {
            user: mongo.ObjectID(req.query.userId),
            supportId: mongo.ObjectID(req.query.supportId),
          },
        ],
      })
      .populate("user")
      .populate("supportId")
      .populate("chat.user")
      .then(async (data) => {
        if (!data || !data._id) {
          let user = await users.findById({ _id: req.query.userId });
          let supportQuestion = await customerSupportModel.findById({
            _id: req.query.supportId,
          });

          return res.status(200).json({
            chat: [],
            _id: "",
            initiated: false,
            user,
            supportQuestion,
          });
        } else {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function readStatuses(req, res, next) {
  try {
    const { requestId } = req.params;
    const request = await requestModel
      .findOne({ _id: ObjectId(requestId) })
      .select("isProviderRead isCustomerRead");
    console.log("request ", request);
    if (request) {
      return res.status(200).send({
        success: true,
        request: request,
        message: "Request Chat Reads found",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "Request Chat Reads Not found",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function createGroup(req, res, next) {
  try {
  
    if (!req.body.name || !req.body.involved_persons)
      return res.status(500).json({
        message: "you maybe missing groupName organization creator ",
        code: "1000",
        success: false,
      });
    req.body.involved_persons.push(req.userId);
    let newRoom = new chatroom({
      name: req.body.name,
      involved_persons: req.body.involved_persons,
      createdBy: req.userId,
      admins: [req.userId],
      chat: [],
    });
    if (req.body.involved_persons) {
      newRoom.involved_persons = req.body.involved_persons;
    }
    if (req.body.img_url) {
      //not defined any key inside the above constructor
      newRoom.img_url = req.body.img_url;
    }

    await newRoom.save();
    res.send(newRoom);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function addUserToGroup(req, res, next) {
  try {
    if (!req.body.involved_persons)
      return res.status(422).json({
        message: "you maybe missing members ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "User can be added to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (req.userId != chatRoomInfo?.createdBy) {
      return res.status(400).send({
        message: "You dont have right to add or remove participents.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $addToSet: { involved_persons: { $each: req.body.involved_persons } },
        }
      )
      .then((data) => {
        console.log("data ", data);
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}


async function removeUserFromGroup(req, res, next) {
  try {

    const { involved_person, chatRoomId } = req.body;
    console.log("Received data:", req.body);

    // Validate required fields
    if (!involved_person || !chatRoomId) {
      return res.status(422).json({
        message: "You may be missing organization or members",
        code: "1000",
        success: false,
      });
    }

    // Validate chatRoomId
    if (!mongo.ObjectID.isValid(chatRoomId)) {
      return res.status(400).json({
        message: "Invalid chatRoomId",
        code: "1001",
        success: false,
      });
    }

    // Fetch chat room info
    const chatRoomInfo = await chatroom.findOne({ _id: chatRoomId });
    console.log("chatRoomInfo:", chatRoomInfo);

    if (!chatRoomInfo) {
      return res.status(404).json({
        message: "Chat room not found",
        code: "1002",
        success: false,
      });
    }

    if (chatRoomInfo.roomType !== "group") {
      return res.status(400).json({
        message: "User can be removed only from group chat.",
        code: "1000",
        success: false,
      });
    }

    if (!chatRoomInfo.admins.includes(req.userId)) {
      return res.status(403).json({
        message: "You don't have the right to add or remove participants.",
        code: "1000",
        success: false,
      });
    }

    if (chatRoomInfo.createdBy === involved_person) {
      return res.status(400).json({
        message: "Can't remove this user because they created this group.",
        code: "1000",
        success: false,
      });
    }

    console.log("involved_persons ids", involved_person)
  // Convert involved_person to ObjectId(s)
  const involvedPersonsToRemove = Array.isArray(involved_person)
  ? involved_person.map((id) => mongoose.Types.ObjectId(id))
  : [mongoose.Types.ObjectId(involved_person)];

console.log("Removing involved persons:", involvedPersonsToRemove);

  await chatroom.updateOne(
    { _id: chatRoomId },
    { $pull: { involved_persons: { $in: involvedPersonsToRemove } } } // Match any in the array
  );

    return res.status(200).json({
      message: "User removed successfully",
      code: "1000",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Oops! Something went wrong",
      code: "1002",
      success: false,
    });
  }
}

//Delete Group
async function deleteGroup(req, res, next) {
  try {
    const { chatRoomId } = req.params;
    console.log("chatRoomId is", chatRoomId)
    // Validate chatRoomId
    if (!chatRoomId) {
      return res.status(422).json({
        message: "Missing chatRoomId",
        code: "1000",
        success: false,
      });
    }

    if (!mongo.ObjectId.isValid(chatRoomId)) {
      return res.status(400).json({
        message: "Invalid chatRoomId",
        code: "1001",
        success: false,
      });
    }

    // Fetch chat room info
    const chatRoomInfo = await chatroom.findOne({ _id: chatRoomId });

    if (!chatRoomInfo) {
      return res.status(404).json({
        message: "Chat room not found",
        code: "1002",
        success: false,
      });
    }

    if (chatRoomInfo.roomType !== "group") {
      return res.status(400).json({
        message: "Only group chats can be deleted.",
        code: "1003",
        success: false,
      });
    }

    // Check if the user has permission to delete the group
    if (chatRoomInfo.createdBy.toString() !== req.userId.toString() && 
        !chatRoomInfo.admins.includes(req.userId)) {
      return res.status(403).json({
        message: "You don't have the permission to delete this group.",
        code: "1004",
        success: false,
      });
    }

    // Delete messages and group using transactions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all messages related to this chat room
      await message.deleteMany({ chatRoomId }, { session });

      // Delete the chat room itself
      await chatroom.deleteOne({ _id: chatRoomId }, { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Group and associated messages deleted successfully",
        code: "1000",
        success: true,
      });
    } catch (error) {
      // Rollback transaction in case of error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Oops! Something went wrong",
      code: "1002",
      success: false,
    });
  }
}

//Edit Group
async function editGroup(req, res) {
  try {
    const { chatRoomId, roomType, groupName, newMembers } = req.body;
    const userId = req.userId; // Assuming `userId` is obtained from auth middleware.

    // Validate required fields
    if (!chatRoomId || !roomType || !["public", "private", "onlyInvitation"].includes(roomType)) {
      return res.status(422).json({
        message: "Invalid or missing required fields",
        code: "1000",
        success: false,
      });
    }

    // Validate chatRoomId
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      return res.status(400).json({
        message: "Invalid chatRoomId",
        code: "1001",
        success: false,
      });
    }

    // Fetch chat room info
    const chatRoomInfo = await chatroom.findOne({ _id: chatRoomId });
    if (!chatRoomInfo) {
      return res.status(404).json({
        message: "Chat room not found",
        code: "1002",
        success: false,
      });
    }

    // Ensure the user is an admin of the group
    if (!chatRoomInfo.admins.includes(userId)) {
      return res.status(403).json({
        message: "You don't have permission to edit this group",
        code: "1003",
        success: false,
      });
    }

    // Update groupType
    chatRoomInfo.roomType = roomType;

    // Update groupName if provided
    if (groupName) {
      chatRoomInfo.name = groupName;
    }

    console.log("new memeber array is", newMembers)
    // Add new members if provided
    if (newMembers && Array.isArray(newMembers) && newMembers.length > 0) {
      const validNewMembers = await users
        .find({ _id: { $in: newMembers }, isSuspend: false })
        .select("_id");

       
      const validNewMemberIds = validNewMembers.map((member) => member._id.toString());
      const membersToAdd = validNewMemberIds.filter(
        (id) => !chatRoomInfo.involved_persons.includes(id)
      );
       console.log("validNewMemberIds are", validNewMemberIds)
      chatRoomInfo.involved_persons.push(...membersToAdd);
    }

    // Save changes to chatRoom
    await chatRoomInfo.save();

    return res.status(200).json({
      message: "Group updated successfully",
      code: "1000",
      success: true,
    });
  } catch (error) {
    console.error("Error editing group:", error);

    return res.status(500).json({
      message: "Oops! Something went wrong",
      code: "1002",
      success: false,
    });
  }
}

//One user all groups
async function getUserGroups(req, res) {
  try {
    console.log("api is hitting")
    const  userId  = req.userId; // Assuming userId is passed as a URL parameter
    console.log("userId is", userId)
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
        code: "1001",
        success: false,
      });
    }
 
    console.log("user id is", userId)
    // Fetch all groups where the user is part of the involved_persons array
    const userGroups = await chatroom.find({ involved_persons: userId })
    .populate({
      path: 'involved_persons',
      select: 'name'
    })
    .populate({
      path: 'admins',
      select: 'name'
    })

    if (userGroups.length === 0) {
      return res.status(404).json({
        message: "No groups found for this user",
        code: "1002",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User's groups fetched successfully",
      code: "1000",
      success: true,
      data: userGroups,
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);

    return res.status(500).json({
      message: "Oops! Something went wrong",
      code: "1002",
      success: false,
    });
  }
}
//One group detail
async function getGroupDetails(req, res) {
  try {
    const { groupId } = req.params;

    // Validate groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "Invalid groupId",
        code: "1001",
        success: false,
      });
    }

    // Fetch group details with member and admin details populated
    const groupDetails = await chatroom
      .findOne({ _id: groupId })
      .populate({
        path: "involved_persons",
        select: "name _id email", // Fields to include for members
      })
      .populate({
        path: "admins",
        select: "name _id email", // Fields to include for admins
      });

    if (!groupDetails) {
      return res.status(404).json({
        message: "Group not found",
        code: "1002",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Group details fetched successfully",
      code: "1000",
      success: true,
      data: groupDetails,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);

    return res.status(500).json({
      message: "Oops! Something went wrong",
      code: "1002",
      success: false,
    });
  }
}



async function addAdminToGroup(req, res, next) {
  try {
    const { newAdminUserId } = req.body;
    if (!req.body.newAdminUserId)
      return res.status(422).json({
        message: "userId of new admin needed ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "Admin can be added to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (!chatRoomInfo?.admins?.includes(req.userId)) {
      return res.status(400).send({
        message: "You dont have right to add or remove admins.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $addToSet: { admins: newAdminUserId },
        }
      )
      .then((data) => {
        console.log("data ", data);
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function removeAdminToGroup(req, res, next) {
  try {
    const { removeAdminUserId } = req.body;
    if (!req.body.removeAdminUserId)
      return res.status(422).json({
        message: "userId of removing admin needed ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "Admin can be added to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (!chatRoomInfo?.admins?.includes(req.userId)) {
      return res.status(400).send({
        message: "You dont have right to add or remove admins.",
        code: "1000",
        success: false,
      });
    }
    if (chatRoomInfo?.createdBy == removeAdminUserId) {
      return res.status(400).send({
        message: "Can't remove this user because they created this group.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $pull: { admins: removeAdminUserId },
        }
      )
      .then((data) => {
        console.log("data ", data);
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function updateGroup(req, res, next) {
  try {
    if (!req.body.chatRoomId || !req.body.name)
      return res.status(422).json({
        message: "you maybe missing room and name of the chat ",
        code: "1000",
        success: false,
      });
    console.log(
      "req.body.chatRoomId, req.body.name ",
      req.body.chatRoomId,
      req.body.name
    );
    const chatRoomInfo = await chatroom.findOne({
      _id: req.body.chatRoomId,
      roomType: "group",
    });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (req.userId != chatRoomInfo?.createdBy) {
      return res.status(400).send({
        message: "You dont have right to change name of group.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $set: {
            //involved_persons: req.body.involved_persons,
            name: req.body.name ? req.body.name : chatRoomInfo?.name,
          },
        }
      )
      .then((data) => {
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function saveGroupChat(req, res, next) {
  try {
    if (
      !req.body.email ||
      !req.body.message ||
      !req.body.createdBy ||
      !req.body.roomId
    )
      return res.status(500).json({
        message:
          "you maybe missing groupName organization creator or involved_person",
        code: "1000",
        success: false,
      });

    let newMessage = new message({
      user: req.body.email,
      message: req.body.message,
    });

    await chatroom.update(
      { _id: req.body.roomId },
      {
        $push: {
          chat: newMessage,
        },
      }
    );
    res.send("added");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getGroup(req, res, next) {
  try {
    if (!req.query.chatRoomId)
      return res.status(500).json({
        message: "you maybe missing chatroom ",
        code: "1000",
        success: false,
      });
    const userPrivacySetting = await privacySetting.findOne({
      userId: req.userId,
    });
    console.log("userPrivacySetting ", userPrivacySetting);
    await chatroom
      .findOne({
        _id: mongo.ObjectID(req.query.chatRoomId),
        $or: [
          { involved_persons: { $in: req.userId } },
          {
            $or: [
              {
                userA: mongo.ObjectID(req.userId),
              },
              {
                userB: mongo.ObjectID(req.userId),
              },
            ],
          },
        ],
      })
      .populate("involved_persons userA userB")
      .populate("chat.user")
      .then(async (data) => {
        console.log(data);
        if (userPrivacySetting?.readReceipts) {
          //add logic for chatroom open means all messages read
          const updateMessages = await message.updateMany(
            {
              chatRoomId: req.query.chatRoomId,
              readReceipts: { $nin: req.userId },
              user: { $nin: req.userId },
            },
            {
              $push: {
                readReceipts: req.userId,
                readReceiptsWithTime: {
                  user: req.userId,
                },
              },
            }
          );
          console.log("updateMessages ", updateMessages);
        }

        return res.status(200).json({
          message: "groups found",
          code: 1000,
          success: true,
          data,
        });
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getGroupPrivateMessages(req, res, next) {
  try {
    let { chatRoomId, limit, pageNo } = req.query;
    if (!req.query.chatRoomId)
      return res.status(500).json({
        message: "you maybe missing chatroom ",
        code: "1000",
        success: false,
      });
    let messages;
    if (pageNo && limit) {
      console.log("pageNo,limit ", pageNo, limit);
      console.log("check before converting into integer ali", pageNo)
      pageNo = parseInt(pageNo);
      console.log("check after converting into integer ali", pageNo)
      limit = parseInt(limit);
      messages = await message
        .find({
          chatRoomId: mongo.ObjectID(req.query.chatRoomId),
        })
        .populate("users")
        .skip(pageNo > 0 ? (pageNo - 1) * limit : 0)
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      messages = await message
        .find({
          chatRoomId: mongo.ObjectID(req.query.chatRoomId),
        })
        .populate("users")
        .sort({ createdAt: -1 });
    }

    if (messages) {
      return res.status(200).json({
        message: "chatroom messages found",
        code: 1000,
        success: true,
        messages: messages.reverse(),
      });
    } else {
      return res.status(200).json({
        message: "chatroom messages couldnt be found",
        code: 1000,
        success: false,
        messages: messages,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getGroupMessageReceipts(req, res, next) {
  try {
    let { chatRoomId, messageId } = req.query;
    if (!req.query.chatRoomId)
      return res.status(500).json({
        message: "you maybe missing chatroom ",
        code: "1000",
        success: false,
      });
    const chatRoom = await chatroom.findOne({ _id: chatRoomId });
    if (
      chatRoom.involved_persons.includes(req.userId) ||
      chatRoom?.userA == req.userId ||
      chatRoom?.userB == req.userId
    ) {
      const messageInfo = await message
        .findOne({ _id: messageId })
        .select("readReceiptsWithTime")
        .populate("readReceiptsWithTime.user");
      if (messageInfo) {
        return res.status(200).json({
          message: "chatroom messages found",
          code: 1000,
          success: true,
          readReceiptsWithTime: messageInfo.readReceiptsWithTime,
        });
      } else {
        return res.status(200).json({
          message: "message id not valid",
          code: 1000,
          success: false,
        });
      }
    } else {
      return res.status(400).json({
        message: "you are not allowed to see Receipts of this message",
        code: 1000,
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getAllGroupPrivateChats(req, res, next) {
  try {
    if (!req.userId)
      return res.status(400).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .find({
        $or: [
          { involved_persons: { $in: req.userId } },
          {
            $or: [
              {
                userA: mongoose.Types.ObjectId(req.userId),
              },
              {
                userB: mongoose.Types.ObjectId(req.userId),
              },
            ],
          },
        ],
      })
      .populate("userA userB")
      .populate({
        path: "chat",
        options: { sort: { createdAt: -1 }, limit: 1 }, // Sort by createdAt in descending order and limit to 1 message
      })
      .sort({ updatedAt: -1 })
      .then((data) => {
        // Construct the response without the "chat" key
        const responseData = data.map((chatroom) => {
          const { chat, ...rest } = chatroom._doc;
          return {
            ...rest,
            lastMessage: chatroom.chat[0],
          };
        });

        return res.status(200).json({
          message: "All groups chats found",
          code: "1002",
          success: true,
          chats: responseData,
        });
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function searchAllGroupPrivateChats(req, res, next) {
  try {
    const { searchQuery } = req.params;
    if (!req.userId)
      return res.status(400).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .find({
        involved_persons: { $in: req.userId },
        name: { $regex: searchQuery, $options: "i" },
      })
      //.populate("involved_persons")
      .select("-chat")

      .then((data) => {
        return res.status(200).json({
          message: "All groups chats found",
          code: "1002",
          success: true,
          chats: data,
        });
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
const runScript = async (req, res) => {
  try {
    // const updatedMessages=await message.updateMany({
    // },{
    //   $set:{
    //     readReceipts:[],
    //     readReceiptsWithTime:[]
    //   }
    // })
    // console.log("updatedMessages ",updatedMessages)
    const deletedMessages = await message.deleteMany({});
    console.log("deletedMessages ", deletedMessages);
    const updatedChatrooms = await chatroom.updateMany(
      {},
      {
        $set: {
          chat: [],
        },
      }
    );
    console.log("updatedChatrooms ", updatedChatrooms);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// async function onChatroomOpen(req, res, next) {
//   try {
//     const { requestId, userId } = req.body;
//     const user = await users.findOne({ "_id": ObjectId(userId) });
//     console.log("user ", user)
//     if (user.role) {
//       await requestModel.updateOne(
//         { _id: requestId },
//         {
//           $set: {
//             isProviderRead: true
//           }
//         }
//       )
//       return res.status(200).json({
//         success: true,
//         message: "Read Operation Performed"
//       })
//     } else {
//       await requestModel.updateOne(
//         { _id: requestId },
//         {
//           $set: {
//             isCustomerRead: true
//           }
//         }
//       )
//       return res.status(200).json({
//         success: true,
//         message: "Read Operation Performed"
//       })
//     }

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "oops something went wrong",
//       code: "1002",
//       success: false,
//     });
//   }
// }
module.exports.createPrivateChat = createPrivateChat;
module.exports.createRequestPrivateChat = createRequestPrivateChat;
module.exports.createSupportChat = createSupportChat;
module.exports.savePrivateChat = savePrivateChat;
module.exports.getPrivateChat = getPrivateChat;
module.exports.getSupportChat = getSupportChat;
module.exports.getRequestPrivateChat = getRequestPrivateChat;
module.exports.getAllPrivateChat = getAllPrivateChat;
module.exports.deleteChatRoom = deleteChatRoom;
module.exports.searchPrivateChatRoom = searchPrivateChatRoom;
module.exports.onReadChat = onReadChat;
module.exports.readStatuses = readStatuses;
module.exports.createGroup = createGroup;
module.exports.saveGroupChat = saveGroupChat;
module.exports.getGroup = getGroup;
module.exports.addUserToGroup = addUserToGroup;
module.exports.removeUserFromGroup = removeUserFromGroup;
module.exports.updateGroup = updateGroup;
module.exports.getAllGroupPrivateChats = getAllGroupPrivateChats;
module.exports.searchAllPrivateChat = searchAllPrivateChat;
module.exports.searchAllGroupPrivateChats = searchAllGroupPrivateChats;
module.exports.addAdminToGroup = addAdminToGroup;
module.exports.removeAdminToGroup = removeAdminToGroup;
module.exports.getGroupPrivateMessages = getGroupPrivateMessages;
module.exports.getGroupMessageReceipts = getGroupMessageReceipts;
module.exports.runScript = runScript;
module.exports.deleteGroup = deleteGroup;
module.exports.editGroup = editGroup;
module.exports.getUserGroups = getUserGroups;
module.exports.getGroupDetails = getGroupDetails;

//module.exports.onChatroomOpen = onChatroomOpen;
