import React, {
  useEffect,
  useCallback,
  useState,
  useLayoutEffect,
  useRef,
} from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "@/Store/User";
import { ProfileAvatar } from "@/Components/SignUp/profile-avatar.component";
import { Normalize } from "@/Utils/Shared/NormalizeDisplay";
import { AppHeader } from "@/Components";
import firestore from "@react-native-firebase/firestore";
import { Modal, Card, Button, Icon, Text } from "@ui-kitten/components";
import Clipboard from "@react-native-clipboard/clipboard";
import { useIsFocused } from "@react-navigation/native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import ChangeSearchString from "@/Store/Blogs/ChangeSearchString";
import BlockUser from "@/Services/Comments/BlockUser";
import Toast from "react-native-toast-message";
import { navigateAndSimpleReset } from "@/Navigators/Functions";

const SingleChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainReceiverUser, setReceiverUser] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const dispatch = useDispatch();

  const firstEnter = useRef(true);
  const isMsgDeleted = useRef(false);

  const isFocused = useIsFocused();

  const user = useSelector((state: { user: UserState }) => state.user.item);
  const params =
    route && route.params && route.params.params
      ? route.params.params
      : route.params;
  const fromChats = params && params?.fromChats;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <Text>USER</Text>
        </View>
      ),
      headerRight: () => <Text>TEST</Text>,
    });
  }, [navigation]);

  useEffect(() => {
    const { chatId } = route.params;
    // const { receiverUser } = route.params;

    setReceiverUser(route?.params?.receiverUser);

    if (isFocused) {
      firstEnter.current = true;
      getAllMessages();
    }

    const query = firestore()
      .collection("MESSAGE")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(1);

    const unsubscribe = query.onSnapshot((querySnapshot) => {
      const newMessages: any[] = [];
      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          if (doc)
            newMessages.push({
              ...doc.data(),
              createdAt: doc.data()?.createdAt.toDate(),
            });
        });
      }

      // NEEDS TO CALL ONLY IF NOT FIRST ENTER

      if (!firstEnter.current && !isMsgDeleted.current) {
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessages)
        );
      } else if (isMsgDeleted.current) {
        // This is a fix for flicking
        getAllMessages();
      }
    });

    return () => unsubscribe();
  }, [isFocused]);

  const getAllMessages = () => {
    setLoading(true);
    firestore()
      .collection("MESSAGE")
      .doc(params.chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .get()
      .then((res) => {
        const newMessages: any[] = [];

        res.forEach((msg) => {
          newMessages.push({
            ...msg.data(),
            createdAt: msg.data()?.createdAt.toDate(),
          });
        });
        setMessages(newMessages);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const updateChat = () => {
    firestore()
      .collection("MESSAGE")
      .doc(params.chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .get()
      .then((res) => {
        const newMessages: any[] = [];

        res.forEach((msg) => {
          newMessages.push({
            ...msg.data(),
            createdAt: msg.data()?.createdAt.toDate(),
          });
        });
        setMessages(newMessages);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const sendChatMessage = (message: any) => {
    const newMessage = {
      _id: message._id,
      text: message.text,
      createdAt: firestore.Timestamp.fromDate(new Date()),
      user: message.user,
    };

    return new Promise((resolve, reject) => {
      firestore()
        .collection("MESSAGE")
        .doc(params.chatId)
        .collection("messages")
        .doc(message?._id)
        .set(newMessage)
        .then((docRef) => {
          // THIS WILL UPDATE RECENT MESSAGE ON THREAD

          firestore()
            .collection("THREADS")
            .doc(params.chatId)
            .update({
              recentMessage: newMessage,
            })
            .then((res) => resolve(res));
        })
        .catch((err) => reject(err));
    });
  };

  const onSend = useCallback(
    async (messages = []) => {
      isMsgDeleted.current = false;
      firstEnter.current = false; // change firstEnter
      await sendChatMessage(messages[0]);
      updateChat();
    },
    [params.chatId]
  );

  const setModalVisible = () => {
    setChatModalVisible(true);
  };

  const deleteSingleChat = async () => {
    const { chattersIds } = route.params;
    if (chattersIds && chattersIds[0] !== user?.id) {
      setLoading(false);
      setChatModalVisible(false);
      Alert.alert(
        "Delete chat?",
        "The chat can only be completely deleted by the creator. Press YES if you want to remove it only for yourself.",
        [
          { text: "CANCEL", style: "cancel" },
          {
            text: "YES",
            onPress: async () => {
              await deleteChatSelfOnly(chattersIds);
            },
          },
        ]
      );
    } else {
      await deleteCollection("MESSAGE", 10);
      navigation.navigate("Chats");
    }
  };

  const deleteChatSelfOnly = async (chatters: []) => {
    setLoading(true);
    let tempChatters = chatters.filter((item) => item === user?.id);
    firestore()
      .collection("THREADS")
      .doc(params.chatId)
      .update({ chattersIds: tempChatters })
      .then((res) => {
        setLoading(false);
        navigation.navigate("Chats");
        return;
      })
      .catch((err) => {
        setLoading(false);
        return;
      });
  };

  const deleteCollection = (collectionPath: string, batchSize: any) => {
    setLoading(true);
    const collectionRef = firestore()
      .collection(collectionPath)
      .doc(params.chatId);
    const query = collectionRef.collection("messages").limit(batchSize);
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
  };

  const deleteQueryBatch = async (query: any, resolve: any) => {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      await firestore().collection("MESSAGE").doc(params.chatId).delete();
      await firestore().collection("THREADS").doc(params.chatId).delete();
      setLoading(false); // FINISHED WITH DELETING
      setChatModalVisible(false);
      resolve();
      return;
    }

    const batch = firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    process.nextTick = setImmediate;
    process.nextTick(() => {
      deleteQueryBatch(query, resolve);
    });
  };

  const deleteSingleMessage = (message: any) => {
    if (message?.user?._id !== user.id) {
      // If there is a restriction for delete
      Alert.alert(
        "You can only delete messages you have sent. You can't delete someone else message."
      );
      return;
    } else {
      // If there is no restriction
      isMsgDeleted.current = true;
      firestore()
        .collection("MESSAGE")
        .doc(params.chatId)
        .collection("messages")
        .doc(message?._id)
        .delete()
        .then((res) => getAllMessages())
        .catch((err) => (isMsgDeleted.current = false));
    }
  };

  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={"large"} color="#309C99" />
      </View>
    );
  };

  const renderNoUserMessage = () => {
    return (
      <View style={{ padding: 7 }}>
        <Text category={"s2"}>This chat has been removed by the user.</Text>
        <Text category={"s2"}>You can't send any new message.</Text>
      </View>
    );
  };

  const blockUser = (id: any, username: any) => {
    BlockUser(id)
      .then(() => {
        setChatModalVisible(false);
        navigateAndSimpleReset("Chats");
        Toast.show({
          type: "success",
          position: "top",
          text1: `${username} has been blocked.`,
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          onShow: () => {},
          onHide: () => {},
          onPress: () => {},
        });
      })
      .catch(() =>
        Toast.show({
          type: "info",
          position: "top",
          text1: "Info",
          text2: "Please check your network connection and try again",
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          onShow: () => {},
          onHide: () => {},
          onPress: () => {},
        })
      );
  };
  return (
    <>
      <AppHeader
        chatHeader
        sender={params?.receiverUser}
        setModalVisible={setModalVisible}
        fromChats={fromChats}
      />
      <GiftedChat
        renderLoading={renderLoading}
        messages={messages}
        alwaysShowSend={true}
        showAvatarForEveryMessage={true}
        renderInputToolbar={
          params?.chattersIds.length <= 1
            ? () => renderNoUserMessage()
            : undefined
        }
        onSend={(messages) => onSend(messages)}
        user={{
          _id: user?.id,
          name: user?.username,
          avatar: user?.pictureUrl,
        }}
        renderAvatar={null}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: "#fff",
                },
                right: {
                  backgroundColor: "#289490",
                },
              }}
            />
          );
        }}
        onLongPress={(context, message) => {
          const options = ["Copy Message", "Delete Message", "Cancel"];
          const cancelButtonIndex = options.length - 1;
          context.actionSheet().showActionSheetWithOptions(
            {
              options,
              cancelButtonIndex,
            },
            (buttonIndex) => {
              switch (buttonIndex) {
                case 0:
                  Clipboard.setString(message.text);
                  break;
                case 1:
                  deleteSingleMessage(message);
                  break;
              }
            }
          );
        }}
      />

      <Modal visible={chatModalVisible} style={{ width: "60%" }}>
        <Card disabled={true}>
          <Button onPress={() => deleteSingleChat()} style={styles.btnAction}>
            <>
              <Icon style={styles.icon} fill="#fff" name="trash-2-outline" />
              <Text style={styles.btnActionsTxt}>Delete</Text>
            </>
          </Button>
          <Button
            onPress={() =>
              dispatch(
                ChangeModalState.action({
                  flagBlogModal: true,
                })
              )
            }
            style={styles.btnAction}
          >
            <>
              <Icon style={styles.icon} fill="#fff" name="flag-outline" />
              <Text style={styles.btnActionsTxt}>Flag</Text>
            </>
          </Button>
          <Button
            onPress={() => blockUser(receiverUser?.id, receiverUser?.username)}
            style={styles.btnAction}
          >
            <>
              <Icon name={"minus-circle"} style={styles.icon} fill="#fff" />
              <Text style={styles.btnActionsTxt}>Block</Text>
            </>
          </Button>

          <Button
            onPress={() => setChatModalVisible(false)}
            style={styles.btnAction}
            appearance="ghost"
          >
            <>
              <Text style={[styles.btnActionsTxt, { color: "#404040" }]}>
                CANCEL
              </Text>
            </>
          </Button>
        </Card>
      </Modal>
    </>
  );
  // return (!mainReceiverUser && !params) || loading ? (
  //   renderLoading()
  // ) : (
  //   <>
  //     <AppHeader
  //       chatHeader
  //       sender={params?.receiverUser}
  //       setModalVisible={setModalVisible}
  //       fromChats={fromChats}
  //     />
  //     <GiftedChat
  //       renderLoading={renderLoading}
  //       messages={messages}
  //       alwaysShowSend={true}
  //       showAvatarForEveryMessage={true}
  //       renderInputToolbar={
  //         params?.chattersIds.length <= 1
  //           ? () => renderNoUserMessage()
  //           : undefined
  //       }
  //       onSend={(messages) => onSend(messages)}
  //       user={{
  //         _id: user?.id,
  //         name: user?.username,
  //         avatar: user?.pictureUrl,
  //       }}
  //       renderAvatar={null}
  //       renderBubble={(props) => {
  //         return (
  //           <Bubble
  //             {...props}
  //             wrapperStyle={{
  //               left: {
  //                 backgroundColor: "#fff",
  //               },
  //               right: {
  //                 backgroundColor: "#289490",
  //               },
  //             }}
  //           />
  //         );
  //       }}
  //       onLongPress={(context, message) => {
  //         const options = ["Copy Message", "Delete Message", "Cancel"];
  //         const cancelButtonIndex = options.length - 1;
  //         context.actionSheet().showActionSheetWithOptions(
  //           {
  //             options,
  //             cancelButtonIndex,
  //           },
  //           (buttonIndex) => {
  //             switch (buttonIndex) {
  //               case 0:
  //                 Clipboard.setString(message.text);
  //                 break;
  //               case 1:
  //                 deleteSingleMessage(message);
  //                 break;
  //             }
  //           }
  //         );
  //       }}
  //     />

  //     <Modal visible={chatModalVisible} style={{ width: "60%" }}>
  //       <Card disabled={true}>
  //         <Button onPress={() => deleteSingleChat()} style={styles.btnAction}>
  //           <>
  //             <Icon style={styles.icon} fill="#fff" name="trash-2-outline" />
  //             <Text style={styles.btnActionsTxt}>Delete</Text>
  //           </>
  //         </Button>
  //         <Button
  //           onPress={() =>
  //             dispatch(
  //               ChangeModalState.action({
  //                 flagBlogModal: true,
  //               })
  //             )
  //           }
  //           style={styles.btnAction}
  //         >
  //           <>
  //             <Icon style={styles.icon} fill="#fff" name="flag-outline" />
  //             <Text style={styles.btnActionsTxt}>Flag</Text>
  //           </>
  //         </Button>
  //         <Button
  //           onPress={() => blockUser(receiverUser?.id, receiverUser?.username)}
  //           style={styles.btnAction}
  //         >
  //           <>
  //             <Icon name={"minus-circle"} style={styles.icon} fill="#fff" />
  //             <Text style={styles.btnActionsTxt}>Block</Text>
  //           </>
  //         </Button>

  //         <Button
  //           onPress={() => setChatModalVisible(false)}
  //           style={styles.btnAction}
  //           appearance="ghost"
  //         >
  //           <>
  //             <Text style={[styles.btnActionsTxt, { color: "#404040" }]}>
  //               CANCEL
  //             </Text>
  //           </>
  //         </Button>
  //       </Card>
  //     </Modal>
  //   </>
  // );
};

const styles = StyleSheet.create({
  btnActionsTxt: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  profileAvatar: {
    width: Normalize(100),
    height: Normalize(100),
    borderRadius: Normalize(75),
    alignSelf: "center",
  },
  profileImage: {
    width: Normalize(100),
    height: Normalize(100),
    borderRadius: Normalize(75),
    alignSelf: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  btnAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
export default SingleChatScreen;
