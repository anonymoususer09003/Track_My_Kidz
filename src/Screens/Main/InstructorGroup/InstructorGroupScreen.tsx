import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Icon, Input, Select, SelectItem } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useStateValue } from "@/Context/state/State";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import fetchOneUserService from "@/Services/User/FetchOne";
import ChangeUserState from "@/Store/User/FetchOne";
import { actions } from "@/Context/state/Reducer";
import {
  InstructionsModal,
  RequestPermissionModalGroups,
  ShowStudentsInstructorsGroupModal,
} from "@/Modals";
import SetChatParam from "@/Store/chat/SetChatParams";
import ChangeNavigationCustomState from "@/Store/Navigation/ChangeNavigationCustomState";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {
  DeleteGroup,
  GetAllGroup,
  GetgroupByUserId,
  FindGroupsByName,
  GetGroupCount,
} from "@/Services/Group";
import {
  loadId,
  loadUserId,
  storeHomeScreenCacheInfo,
  getHomeScreenCacheInfo,
} from "@/Storage/MainAppStorage";
import GetGroupByInstructor from "@/Services/Group/GetGroupByInstructor";
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from "@/Utils/Hooks/usePrevious";
import {
  GetAllInstructors,
  GetInstructor,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";
import axios from "axios";
import MaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";
const InstructorGroupScreen = ({ route }) => {
  const navigation = useNavigation();
  const dependent = route && route.params && route.params.dependent;
  const isFocused = useIsFocused();
  const swipeableRef = useRef(null);
  const [user, setUser] = useState(null);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  const abortControllerRef = useRef(new AbortController());

  let signal = {
    signal: abortControllerRef.current.signal,
  };
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const [, _dispatch] = useStateValue();
  const dispatch = useDispatch();
  const [initialize, setInitialize] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedInstructorGroup, setSelectedInstructorGroup] = useState(null);
  const [page, pageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const previousSearchParam = usePrevious(searchParam);
  const [groupCount, setGroupCount] = useState({});
  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] =
    useState(false);
  const [selectionData, setSelectionData] = useState({
    type: "student",
    status: "pending",
    group: null,
  });
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.requestPermissionModalGroupVisibility
  );
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const getGroups = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    const id = await loadId();
    // console.log("id", id);

    GetAllGroup(id, refreshing ? page : 0, pageSize, {
      cancelToken: source.token,
    })
      .then((res) => {
        console.log("res", res);

        setRefreshing(false);
        setPageSize(10);

        pageNumber(refreshing ? page + 1 : 1);
        setTotalRecords(res.totalRecords);
        if (page == 0) {
          storeHomeScreenCacheInfo(
            "instructor_groups",
            JSON.stringify(res?.result)
          );
        }
        if (refreshing) {
          setGroups([...groups, ...res?.result]);
        } else {
          setGroups(res?.result);
        }
      })
      .catch((err) => {
        setRefreshing(false);
        setPageSize(10);

        pageNumber(page);
        console.log("Error:", err);
      });
  };
  const getGroupsByUserId = async (refreshing: any) => {
    // const user_id = await loadUserId();
    if (refreshing) {
      setRefreshing(true);
    }
    const id = await loadId();
    console.log("id", id);
    GetgroupByUserId(id, refreshing ? page : 0, pageSize, {
      cancelToken: source.token,
    })
      .then((res) => {
        setTotalRecords(res.totalRecords);
        setRefreshing(false);
        setPageSize(10);
        if (page == 0) {
          storeHomeScreenCacheInfo(
            "instructor_groups",
            JSON.stringify(res?.result)
          );
        }
        pageNumber(refreshing ? page + 1 : 1);
        if (refreshing) {
          setGroups([...groups, ...res?.result]);
        } else {
          setGroups(res?.result);
        }
      })
      .catch((err) => console.log("Error:", err));
  };

  const getGroupByInstructor = async (id: number) => {
    console.log("id----", id);
    GetGroupByInstructor(id, 0, 15, {
      cancelToken: source.token,
    })
      .then((res) => {
        console.log("getGroupByInstructor", res);
        setSelectedInstructorGroup(res);
      })
      .catch((err) => console.log("getGroupByInstructor"));
  };

  const getInstructors = async () => {
    GetAllInstructors(0, 20)
      .then((res) => {
        setInstructors(res);
      })
      .catch((err) => {
        console.log("getInstructors Error:", err);
      });
  };

  const findInstructorBySchoolId = async (res: any) => {
    try {
      let instructorsList = await FindInstructorBySchoolOrg(
        {
          schoolId: res?.schoolId,
          // 2198,
          // res?.schoolId,
          orgId: res?.orgId || null,
        },
        {
          cancelToken: source.token,
        }
        // {
        //   signal: abortControllerRef.current.signal,
        // }
      );
      if (instructorsList) {
        _dispatch({
          type: actions.ORG_INSTRUCTORS,
          payload: { result: instructorsList },
        });

        setInstructors({ result: instructorsList });
        // setOrgInfo(org);
        //   })
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const getInstructor = async () => {
    const userId = await loadUserId();
    console.log("instructor------------------", userId);
    try {
      if (Object.keys(currentUser).length == 0) {
        let res = await GetInstructor(userId, {
          cancelToken: source.token,
        });
        dispatch(
          ChangeUserState.action({
            item: res,
            fetchOne: { loading: false, error: null },
          })
        );
        _dispatch({
          type: actions.INSTRUCTOR_DETAIL,
          payload: res,
        });
        setUser(res);
        console.log("res", res.isAdmin);
        if (res?.isAdmin) {
          await getGroups();
          findInstructorBySchoolId(res);
        } else {
          getGroupsByUserId(userId);
        }
      } else {
        _dispatch({
          type: actions.INSTRUCTOR_DETAIL,
          payload: currentUser,
        });
        setUser(currentUser);
        setUser(currentUser);
        console.log("currentUser", currentUser.isAdmin);
        if (currentUser?.isAdmin) {
          getGroups();
          findInstructorBySchoolId(currentUser);
        } else {
          getGroupsByUserId(userId);
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  // const getInstructor = async () => {
  //   const userId = await loadUserId();
  //   const res = null;
  //   GetInstructor(userId)
  //     .then((res) => {
  //       setUser(res);
  //       console.log("res", res.isAdmin);
  //       if (res?.isAdmin) {
  //         getGroups();
  //       } else {
  //         getGroupsByUserId();
  //       }
  //       FindInstructorBySchoolOrg({
  //         schoolId: res?.schoolId,
  //         orgId: res?.orgId || null,
  //       })
  //         .then((instructors) => {
  //           setInstructors({ result: instructors });
  //           // setOrgInfo(org);
  //         })
  //         .catch((err) => console.log(err));
  //     })

  //     .catch((err) => {
  //       console.log("Error:", err);
  //     });
  // };
  const RightActions = (dragX: any, item) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {true && (
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                prevOpenedRow?.close();
                dispatch(
                  ChangeModalState.action({
                    requestPermissionModalGroupVisibility: true,
                  })
                );
                setSelectedActivity(item);
              }}
            >
              <FontAwesome5 size={25} name="reply-all" color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                prevOpenedRow?.close();
                navigation.navigate("CreateActivity", {
                  groupId: item?.groupId,
                });
              }}
            >
              <MaterialCommunity
                size={25}
                color={Colors.primary}
                name="timetable"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                prevOpenedRow?.close();
                navigation.navigate("CreateGroup", {
                  data: item,
                });
              }}
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                style={{ width: 25, height: 25 }}
                fill={Colors.primary}
                name="edit-2"
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                style={{ width: 25, height: 25 }}
                fill={Colors.primary}
                name="trash"
              /> */}
            {/* </TouchableOpacity> */}
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            prevOpenedRow?.close();

            dispatch(
              SetChatParam.action({
                title: item?.groupName,
                chatId: item?.groupId,
                subcollection: "parent",
                user: {
                  _id: user?.instructorId,
                  avatar: user?.imageurl,
                  name: user?.firstname
                    ? user?.firstname[0].toUpperCase() +
                      user?.firstname.slice(1) +
                      " " +
                      user?.lastname[0]?.toUpperCase()
                    : user?.firstname + " " + user?.lastname,
                },
              })
            );
            navigation.navigate("InstructorChatNavigator", {
              title: item?.groupName,
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
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() =>
                DeleteGroup(item.groupId)
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
          </View>
        )}
      </View>
    );
  };

  const getCacheGroups = async () => {
    let groups = await getHomeScreenCacheInfo("instructor_groups");
    if (groups) {
      setGroups(JSON.parse(groups));
    }
  };
  useEffect(() => {
    dispatch(
      ChangeNavigationCustomState.action({
        navigationLeftDrawer: null,
      })
    );
    setInitialize(true);
    getCacheGroups();
  }, []);

  // useEffect(() => {
  //   if (selectedDependent) {
  //     dispatch(
  //       ChangeModalState.action({ editDependentModalVisibility: true })
  //     );
  //   }
  // }, [selectedDependent]);

  // useEffect(() => {
  //   if (selectedInstructions) {
  //     dispatch(
  //       ChangeModalState.action({ instructionsModalVisibility: true })
  //     );
  //   }
  // }, [selectedInstructions]);

  useDebouncedEffect(
    () => {
      if (
        searchParam &&
        searchParam !== previousSearchParam &&
        (searchParam.length === 0 || searchParam.length > 3)
      ) {
        search();
      } else if (searchParam == "" && initialize) {
        if (user?.isAdmin) {
          getGroups();
        } else {
          getGroupsByUserId();
        }
      }
    },
    [searchParam],
    50
  );

  const search = (text: String) => {
    if (searchParam == "") {
      if (user?.isAdmin) {
        getGroups();
      } else {
        getGroupsByUserId();
      }
    } else {
      FindGroupsByName({ groupName: searchParam }, refreshing ? page : 0, 20)
        .then((res) => {
          console.log("res", res);

          setRefreshing(false);
          setPageSize(10);

          pageNumber(refreshing ? page + 1 : 1);
          setTotalRecords(res.totalRecords);
          if (refreshing) {
            setGroups([...groups, ...res?.result]);
          } else {
            setGroups(res?.result);
          }
        })
        .catch((err) => {
          setRefreshing(false);
          setPageSize(10);

          pageNumber(page);
          console.log("Error:", err);
        });
    }
  };

  const renderIcon = (props: any) => <Icon {...props} name={"search"} />;
  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow?.close();
    }
    prevOpenedRow = row[index];
  };

  const getGroupCountApi = async (body: any) => {
    try {
      let temp = {};
      let res = await GetGroupCount(body);
      res.map((item) => {
        temp[item.groupId] = item;
      });
      setGroupCount({ ...groupCount, ...temp });
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      let temp = [];
      if (groups?.length > 0) {
        groups?.forEach(async (element) => {
          temp.push(element.groupId);
        });
        getGroupCountApi(temp);
        // getGroupCountApi(temp);
      } else if (
        selectedInstructorGroup &&
        selectedInstructorGroup?.length > 0
      ) {
        selectedInstructorGroup?.forEach(async (element) => {
          temp.push(element.groupId);
        });
        getGroupCountApi(temp);
        // getGroupCountApi(temp);
      }
    }
  }, [groups?.length || selectedInstructorGroup?.length, isFocused]);
  useEffect(() => {
    if (isFocused) {
      getInstructor();
    }
    return () => source.cancel("axios request cancelled");
    //  abortControllerRef.current.abort();
  }, [isFocused]);
  console.log("selecetd activitye", selectedActivity);
  return (
    <>
      {isVisible && (
        <RequestPermissionModalGroups
          activity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
        />
      )}
      {selectedInstructions && selectedActivity && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
          group={selectedActivity}
        />
      )}
      {showStudentsInstructorsModal && (
        <ShowStudentsInstructorsGroupModal
          isVisible={showStudentsInstructorsModal}
          setIsVisible={() => {
            setShowStudentsInstructorsModal(false);
          }}
          status={selectionData.status}
          type={selectionData.type}
          group={selectionData.group}
        />
      )}
      <View style={styles.layout}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Input
            //@ts-ignore
            value={searchParam}
            style={{
              width: user?.isAdmin ? "45%" : "90%",
              marginTop: 10,
              marginLeft: user && user?.isAdmin ? "0%" : 10,
            }}
            placeholder="Search"
            accessoryLeft={renderIcon}
            onChangeText={(nextValue) => {
              //@ts-ignore
              // search(nextValue);
              setSearchParam(nextValue);
            }}
          />

          {user?.isAdmin && (
            <Select
              style={{ width: "50%", marginTop: -10 }}
              value={selectedGroup}
              placeholder="Select Name"
              onSelect={(index: any) => {
                if (index.row === 0) {
                  setSelectedInstructor(null);
                  setSelectedInstructorGroup(null);
                } else {
                  setSelectedInstructor(
                    instructors?.result[index.row]?.firstname +
                      " " +
                      instructors?.result[index.row]?.lastname
                  );
                  getGroupByInstructor(
                    instructors?.result[index.row]?.instructorId
                  );
                }
              }}
              label={(evaProps: any) => <Text {...evaProps}></Text>}
            >
              <SelectItem title="All" />
              {instructors &&
                instructors?.result &&
                instructors?.result?.map((item) => (
                  <SelectItem
                    key={item?.instructorId}
                    title={item?.firstname + " " + item?.lastname}
                  />
                ))}
            </Select>
          )}
        </View>
        {groups.length == 0 && (
          <Text style={{ textAlign: "center", marginTop: 5 }}>
            You currently do not have any groups
          </Text>
        )}
        <FlatList
          data={
            selectedInstructorGroup ? selectedInstructorGroup : groups || []
          }
          style={{ padding: 10, width: "100%" }}
          renderItem={({ item, index }) => {
            let temp = [];
            let instructor = item?.instructors?.map((item) =>
              temp.push(item?.firstName)
            );
            return (
              <Swipeable
                ref={(ref) => (row[index] = ref)}
                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <View style={[styles.item, { backgroundColor: "#fff" }]}>
                  <Text
                    style={styles.text}
                  >{`Group Name: ${item?.groupName}`}</Text>
                  {/* <Text style={styles.text}>{`Status: ${
                    item?.status ? "Active" : "Inactive"
                  }`}</Text> */}

                  <Text
                    style={styles.text}
                  >{`Instructors: ${temp.toString()}`}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        setSelectionData({
                          status: "approved",
                          type: "student",
                          group: item,
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>{`Approval: ${
                        groupCount[item.groupId]?.countApprovedStudents || "0"
                      }`}</Text>
                      <Entypo
                        name="book"
                        color={Colors.primary}
                        size={20}
                        style={{ marginHorizontal: 5 }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        setSelectionData({
                          status: "approved",
                          type: "instructor",
                          group: item,
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        <Text style={styles.text}>
                          {groupCount[item.groupId]?.countApprovedInstructors ||
                            "0"}
                        </Text>
                      </Text>
                      <Ionicons
                        name="person"
                        color={Colors.primary}
                        size={20}
                        style={{ marginHorizontal: 5 }}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        setSelectionData({
                          status: "declined",
                          type: "student",
                          group: item,
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>{`Declined: ${
                        groupCount[item.groupId]?.countDeclinedStudents || "0"
                      }`}</Text>
                      <Entypo
                        name="book"
                        color={Colors.primary}
                        size={20}
                        style={{ marginHorizontal: 5 }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        setSelectionData({
                          status: "declined",
                          type: "instructor",
                          group: item,
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        {groupCount[item.groupId]?.countDeclinedInstructors ||
                          "0"}
                      </Text>
                      <Ionicons
                        name="person"
                        color={Colors.primary}
                        size={20}
                        style={{ marginHorizontal: 5 }}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        setSelectionData({
                          status: "pending",
                          type: "student",
                          group: item,
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        {`Pending:  ${
                          groupCount[item.groupId]?.countPendingStudents || "0"
                        }`}
                      </Text>
                      <Entypo
                        name="book"
                        color={Colors.primary}
                        size={20}
                        style={{ marginHorizontal: 5 }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        setSelectionData({
                          status: "pending",
                          type: "instructor",
                          group: item,
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        {groupCount[item.groupId]?.countPendingInstructors ||
                          "0"}
                        {/* {item.countPendingInstructors || `0`} */}
                      </Text>
                      <Ionicons
                        name="person"
                        color={Colors.primary}
                        size={20}
                        style={{ marginHorizontal: 5 }}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedActivity(item);
                      setSelectedInstructions(true);
                      dispatch(
                        ChangeModalState.action({
                          instructionsModalVisibility: true,
                        })
                      );
                    }}
                    style={styles.horizontal}
                  >
                    <Text
                      style={styles.text}
                    >{`Instructions / Disclaimer / Agreement`}</Text>
                  </TouchableOpacity>
                </View>
              </Swipeable>
            );
          }}
          onEndReached={async () => {
            // console.log("logs", originalActivities.result.length);

            console.log("logs", totalRecords);
            if (totalRecords > groups.length) {
              console.log("logs");
              const userId = await loadUserId();
              user?.isAdmin ? getGroups(true) : getGroupsByUserId(userId);
            }
          }}
          refreshing={false}
          onRefresh={() => null}
        />
        {refreshing && (
          <ActivityIndicator size="large" color={Colors.primary} />
        )}
      </View>
      <TouchableOpacity
        style={styles.floatButton}
        onPress={() => navigation.navigate("CreateGroup")}
      >
        <AntDesign name="pluscircle" size={50} color={Colors.primary} />
      </TouchableOpacity>
    </>
  );
};

export default InstructorGroupScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderRadius: 10,
    paddingBottom: 10,
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
  floatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
});
