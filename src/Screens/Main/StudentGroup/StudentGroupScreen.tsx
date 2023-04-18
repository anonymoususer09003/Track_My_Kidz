import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import { InstructionsModal } from "@/Modals";
import {
  DeleteGroup,
  GetAllGroup,
  GetGroupByStudentId,
} from "@/Services/Group";
import { UserState } from "@/Store/User";
import {
  storeHomeScreenCacheInfo,
  getHomeScreenCacheInfo,
} from "@/Storage/MainAppStorage";
import SetChatParam from "@/Store/chat/SetChatParams";
import Ionicons from "react-native-vector-icons/Ionicons";
const StudentGroupScreen = ({ route }) => {
  const navigation = useNavigation();
  const dependent = route && route.params && route.params.dependent;
  const isFocused = useIsFocused();
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedInstructions, setSelectedInstructions] = useState(null);

  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const getGroups = async () => {
    GetGroupByStudentId(currentUser?.studentId)
      .then((res) => {
        setGroups(res);
        storeHomeScreenCacheInfo("student_groups", JSON.stringify(res));
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };
  const getCacheGroups = async () => {
    let group = await getHomeScreenCacheInfo("student_groups");
    if (group) {
      setGroups(JSON.parse(group));
    }
  };
  useEffect(() => {
    getCacheGroups();
  }, [isFocused]);
  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

  useEffect(() => {
    getGroups();
  }, [isFocused]);

  const RightActions = (dragX: any, item: any) => {
    return (
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            dispatch(
              SetChatParam.action({
                title: item?.groupName,
                chatId: item?.groupId,
                subcollection: "student",
                user: {
                  _id: currentUser?.studentId,
                  avatar: currentUser?.imageurl,
                  name: currentUser?.firstname
                    ? currentUser?.firstname[0].toUpperCase() +
                      currentUser?.firstname.slice(1) +
                      "" +
                      currentUser?.lastname[0]
                    : currentUser?.firstname + "" + currentUser?.lastname,
                },
              })
            );
            navigation.navigate("ChatScreen", {
              title: item?.groupName,
              showHeader: true,
            });
          }}
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons size={25} color={Colors.primary} name="chatbox-ellipses" />
        </TouchableOpacity>
        {!item.status && (
          <TouchableOpacity
            style={{
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() =>
              DeleteGroup(item.id)
                .then((res) => {
                  getGroups();
                })
                .catch((err) => {
                  console.log("Error:", err);
                })
            }
          >
            <Icon
              style={{ width: 30, height: 30 }}
              fill={Colors.primary}
              name="trash"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      <View style={styles.layout}>
        {groups.length > 0 && (
          <FlatList
            data={groups}
            style={{ padding: 10, width: "100%" }}
            renderItem={({ item, index }) => (
              <Swipeable
                ref={swipeableRef}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <View style={[styles.item, { backgroundColor: "#fff" }]}>
                  <Text
                    style={styles.text}
                  >{`Group Name: ${item?.groupName}`}</Text>
                  <Text style={styles.text}>{`Status: ${
                    item?.status ? "Active" : "Inactive"
                  }`}</Text>
                  <Text style={styles.text}>{`${
                    item?.students && item?.students?.length
                  } Students`}</Text>
                  <Text style={styles.text}>{`Instructors: ${
                    (item?.instructors && item?.instructors?.length) || 0
                  }`}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedInstructions(item?.optin)}
                  style={[styles.footer, { backgroundColor: "#fff" }]}
                >
                  <Text
                    style={styles.text}
                  >{`Instructions / Disclaimer / Agreement`}</Text>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
        )}
        {groups.length == 0 && (
          <Text style={{ textAlign: "center", marginTop: 5 }}>
            You currently do not have any groups
          </Text>
        )}
      </View>
    </>
  );
};

export default StudentGroupScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginHorizontal: "2%",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
});
