import {Alert} from "react-native";
import firestore from "@react-native-firebase/firestore";
import {CurrentUserDTO} from "@/Models/UserDTOs";
import {navigateAndSimpleReset} from "@/Navigators/Functions";

export const startNewChat = (currentUser: CurrentUserDTO, chatWithUser: CurrentUserDTO) => {
    if (currentUser.id === chatWithUser.id) { // In case users want to start a chat with himself
        Alert.alert("Chat can't be started with yourself.")
        return;
    }

    firestore().collection('THREADS').where('chattersIds', 'array-contains', currentUser?.id).get().then((res) => {

        let hasAlreadyChat = false
        let docRefId = '';
        res.forEach((doc) => {


            if (doc.data() && doc.data().chattersIds.includes(currentUser.id) && doc.data().chattersIds.includes(chatWithUser.id)) {
                docRefId = doc.ref.id
                hasAlreadyChat = true
            }
        })
        const senderUser = {
            id: currentUser?.id,
            username: currentUser?.username,
            name: currentUser?.firstName + ' ' + currentUser?.lastName,
            avatar: currentUser?.pictureUrl
        }

        const receiverUser = {
            id: chatWithUser?.id,
            username: chatWithUser?.username,
            name: chatWithUser?.firstName + ' ' + chatWithUser?.lastName,
            avatar: chatWithUser?.pictureUrl
        }
        const chattersIds: string[] = []

        chattersIds.push(currentUser?.id)
        chattersIds.push(chatWithUser?.id)

        if (!hasAlreadyChat) { // IF THERE IS NO CHAT WITH THE SELECTED USER WE WILL PROCEED

            const roomName = currentUser?.id + "_" + chatWithUser?.id
            const users = []


            users.push(senderUser)
            users.push(receiverUser)

            if (roomName.length > 0) {
                firestore()
                    .collection('THREADS')
                    .add({
                        name: roomName,
                        users,
                        chattersIds,
                        recentMessage: {
                            createdAt: firestore.Timestamp.fromDate(new Date())
                        }
                    })
                    .then((docRef) => {
                        navigateAndSimpleReset('SingleChat', {chatId: docRef.id, receiverUser, chattersIds})
                    })
                    .catch(err => {})
            }

        } else { // THERE IS ALREADY CHAT WITH SELECTED USER
            navigateAndSimpleReset('SingleChat', {chatId: docRefId, receiverUser, chattersIds})
            return
        }

    })
        .catch((err) => {})
}
