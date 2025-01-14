const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const chatController = require("../controllers/chatController");

const auth = require("../middlewares/auth");
const {verifyTokenUser} = require('../middlewares/userMiddleware');
// IMPORTANT NOTE
// WE ARE ONLY USING CREATE PRIVATE CHAT API FOR PRIVATE CHAT APIS. TO GET ALL PRIVATE
// CHATS AND GET SINGLE PRIVATE CHAT, WE ARE USING getAllGroupChats and searchAllGroupChats
// In SHORT WE ARE GETTING PRIVATE AND GROUP CHATS IN ONE API
// router.post("/private",verifyTokenUser, catchErrors(chatController.createPrivateChat));
router.post("/requestprivate", catchErrors(chatController.createRequestPrivateChat));
//router.put("/private", catchErrors(chatController.savePrivateChat));
// router.get("/private",verifyTokenUser, catchErrors(chatController.getPrivateChat));
router.get("/requestprivate", catchErrors(chatController.getRequestPrivateChat));
router.post("/supportchat", catchErrors(chatController.createSupportChat));
router.get("/supportchat", catchErrors(chatController.getSupportChat));
//we are not using both these routes for private chat (getAllPrivateChat, searchAllPrivateChat)
//instead we are using getAllGroupChats and searchAllGroupChats
// /* not using */ router.get("/all",verifyTokenUser, catchErrors(chatController.getAllPrivateChat));
/* not using */ router.get("/all/:searchQuery",verifyTokenUser, catchErrors(chatController.searchAllPrivateChat));
router.post("/onreadchat", catchErrors(chatController.onReadChat));
router.get("/readstatuses/:requestId", catchErrors(chatController.readStatuses));
//Group chats
// router.post("/",verifyTokenUser, catchErrors(chatController.createGroup));
//router.post("/chat",verifyTokenUser, catchErrors(chatController.saveGroupChat));
// router.get("/group/messages",verifyTokenUser, catchErrors(chatController.getGroupPrivateMessages));
router.get("/group/message/receipts",verifyTokenUser, catchErrors(chatController.getGroupMessageReceipts));
router.get("/group",verifyTokenUser, catchErrors(chatController.getGroup));
router.get("/group/all",verifyTokenUser, catchErrors(chatController.getAllGroupPrivateChats));
router.get("/group/all/:searchQuery",verifyTokenUser, catchErrors(chatController.searchAllGroupPrivateChats));
router.put("/group",verifyTokenUser, catchErrors(chatController.updateGroup)); //to update chatname name
// router.post("/user",verifyTokenUser, catchErrors(chatController.addUserToGroup));
// router.delete("/user",verifyTokenUser, catchErrors(chatController.removeUserFromGroup));
router.post("/group/addadmin",verifyTokenUser, catchErrors(chatController.addAdminToGroup));
router.post("/group/removeadmin",verifyTokenUser, catchErrors(chatController.removeAdminToGroup));
router.get('/runscript', chatController.runScript)
//router.post("/onchatroomopen", catchErrors(chatController.onChatroomOpen));

// -----------------------------------Academic Chat Apis ----------------------------------
// Chat room create
router.post("/private",verifyTokenUser, catchErrors(chatController.createPrivateChat));
// Get all single chat
router.get("/private",verifyTokenUser, catchErrors(chatController.getPrivateChat));
//get all public chatroom list
router.get("/all",verifyTokenUser, catchErrors(chatController.getAllPrivateChat));
// Need to find search private chat room
router.get('/search',catchErrors(chatController.searchPrivateChatRoom));

//-------------------------------- Academic Group Chat  -----------------------------------
//Create group
router.post("/",verifyTokenUser, catchErrors(chatController.createGroup));
//One group all message for one user 
router.get("/group/messages",verifyTokenUser, catchErrors(chatController.getGroupPrivateMessages));
//one user added to the group 
router.post("/user",verifyTokenUser, catchErrors(chatController.addUserToGroup));
//One user remove from group 
router.delete("/remove-user", verifyTokenUser, catchErrors(chatController.removeUserFromGroup));
//delete group
router.delete("/remove-group/:chatRoomId", verifyTokenUser, catchErrors(chatController.deleteGroup));
//Edit group
router.put("/edit-group", verifyTokenUser, catchErrors(chatController.editGroup));
//One user all groups
router.get("/user-groups", verifyTokenUser, catchErrors(chatController.getUserGroups));
//One group details
router.get("/group-details/:groupId", verifyTokenUser, catchErrors(chatController.getGroupDetails));

// -----------------------------------Academic Chat Apis ----------------------------------
// Need to find Delete chatroom
router.delete('/:roomId',catchErrors(chatController.deleteChatRoom));

module.exports = router;
