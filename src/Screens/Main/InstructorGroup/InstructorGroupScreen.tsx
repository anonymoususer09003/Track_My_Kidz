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
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import { InstructionsModal, RequestPermissionModalGroups } from "@/Modals";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {
  DeleteGroup,
  GetAllGroup,
  GetgroupByUserId,
  FindGroupsByName,
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

import MaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";
const InstructorGroupScreen = ({ route }) => {
  const navigation = useNavigation();
  const dependent = route && route.params && route.params.dependent;
  const isFocused = useIsFocused();
  const swipeableRef = useRef(null);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
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

    GetAllGroup(id, refreshing ? page : 0, pageSize)
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
    GetgroupByUserId(id, refreshing ? page : 0, pageSize)
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
    GetGroupByInstructor(id, 0, 15)
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

  const getInstructor = async () => {
    const userId = await loadUserId();
    const res = null;
    GetInstructor(userId)
      .then((res) => {
        setUser(res);

        if (res?.isAdmin) {
          getGroups();
        } else {
          getGroupsByUserId();
        }
        FindInstructorBySchoolOrg({
          schoolId: res?.schoolId,
          orgId: res?.orgId || null,
        })
          .then((instructors) => {
            setInstructors({ result: instructors });
            // setOrgInfo(org);
          })
          .catch((err) => console.log(err));
      })

      .catch((err) => {
        console.log("Error:", err);
      });
  };
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
      } else {
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
    if (searchParam === "") {
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
  useEffect(() => {
    getInstructor();
  }, []);
  return (
    <>
      {isVisible && (
        <RequestPermissionModalGroups
          activity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
        />
      )}
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
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
                    <Text style={styles.text}>{`Approval: ${
                      item?.countApprovedStudents || 0
                    } `}</Text>
                    <Entypo
                      name="book"
                      color={Colors.primary}
                      size={20}
                      style={{ marginHorizontal: 5 }}
                    />
                    <Text style={styles.text}>
                      {item?.countApprovedInstructors || `0`}
                    </Text>
                    <Ionicons
                      name="person"
                      color={Colors.primary}
                      size={20}
                      style={{ marginHorizontal: 5 }}
                    />
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.text}>{`Declined: ${
                      item?.countDeclinedStudents || 0
                    } `}</Text>
                    <Entypo
                      name="book"
                      color={Colors.primary}
                      size={20}
                      style={{ marginHorizontal: 5 }}
                    />
                    <Text style={styles.text}>
                      {item?.countDeclinedInstructors || `0`}
                    </Text>
                    <Ionicons
                      name="person"
                      color={Colors.primary}
                      size={20}
                      style={{ marginHorizontal: 5 }}
                    />
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.text}>{`Pending:  ${
                      item?.countPendingStudents || 0
                    } `}</Text>
                    <Entypo
                      name="book"
                      color={Colors.primary}
                      size={20}
                      style={{ marginHorizontal: 5 }}
                    />
                    <Text style={styles.text}>
                      {item.countPendingInstructors || `0`}
                    </Text>
                    <Ionicons
                      name="person"
                      color={Colors.primary}
                      size={20}
                      style={{ marginHorizontal: 5 }}
                    />
                  </View>
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
});
