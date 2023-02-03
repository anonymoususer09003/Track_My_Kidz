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
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import ChangeUserState from "@/Store/User/FetchOne";
import fetchOneUserService from "@/Services/User/FetchOne";
import ChangeCountryState from "@/Store/Places/FetchCountries";
import FetchCountries from "@/Store/Places/FetchCountries";
import { GetAllCountries } from "@/Services/PlaceServices";
import { InstructorActivitiesModal, CancelActivityModal } from "@/Modals";
import ChangeNavigationCustomState from "@/Store/Navigation/ChangeNavigationCustomState";
import {
  InstructionsModal,
  JourneyTrackerModal,
  RollCallModal,
  RequestPermissionModal,
  SetupVehicleModal,
  MarkAllRollCallModal,
  ShowInstructorsStudentsModal,
} from "@/Modals";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {
  DeleteActivity,
  GetActivityByName,
  GetAllActivity,
  FindActivitiesByUserId,
  GetActivitesCount,
} from "@/Services/Activity";
import {
  GetAllInstructors,
  GetInstructor,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";
import {
  loadUserId,
  loadUserType,
  storeHomeScreenCacheInfo,
  getHomeScreenCacheInfo,
} from "@/Storage/MainAppStorage";
import moment from "moment";
import api from "@/Services";
import { UserState } from "@/Store/User";
import { InstructorState } from "@/Store/InstructorsActivity";
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from "@/Utils/Hooks/usePrevious";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import { FindAllBus } from "@/Services/BusConfiguration";
import GetActivityByInstructor from "@/Services/Activity/GetActivityByInstructor";
import { Activity, Optin } from "@/Models/DTOs";
import { PlaceState } from "@/Store/Places";
import ChangeInstructorState from "@/Store/InstructorsActivity/ChangeInstructorActivityState";
import { ModalState } from "@/Store/Modal";
import { abortController } from "@/Utils/Hooks";
import axios from "axios";
const InstructorActivityScreen = ({}) => {
  const [, _dispatch] = useStateValue();
  // const countries = useSelector(
  //   (state: { state: any }) => state.places.countries
  // );
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const { abortControllerRef } = abortController();
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  // let abortControllerRef = useRef<AbortController>(new AbortController());
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const swipeableRef = useRef(null);
  const [activitiesCount, setActivitiesCount] = useState({});
  const dispatch = useDispatch();
  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );
  const showVehicle = useSelector(
    (state: { modal: ModalState }) => state.modal.setupVehicleModal
  );
  const showJourneytracker = useSelector(
    (state: { modal: ModalState }) => state.modal.journeyTrackerModalVisibility
  );
  const rollCallModal = useSelector(
    (state: { modal: ModalState }) => state.modal.rollCallModalVisibility
  );

  const [cancelModal, setCancelModal] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const previousSearchParam = usePrevious(searchParam);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [originalActivities, setOriginalActivities] = useState<Activity[]>([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>(null);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [page, pageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedInstructorActivities, setSelectedInstructorActivities] =
    useState(null);
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.requestPermissionModalVisibility
  );
  const showInstructorModal = useSelector(
    (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  );
  const showRolCall = useSelector(
    (state: { modal: ModalState }) => state.modal.rollCallModalVisibility
  );
  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] =
    useState(false);
  const [selectionData, setSelectionData] = useState({
    type: "student",
    status: "pending",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [buses, setBuses] = useState([]);
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const { selectedDayForFilter, selectedMonthForFilter } = useSelector(
    (state: { instructorsActivity: InstructorState }) =>
      state.instructorsActivity
  );
  // console.log("filterday and month", filterDayAndMonth);
  useEffect(() => {
    dispatch(
      ChangeNavigationCustomState.action({
        navigationLeftDrawer: "activity",
      })
    );
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

  const getActivities = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    // Alert.alert("kjk");

    GetAllActivity(refreshing ? page : 0, pageSize, {
      cancelToken: source.token,
    })
      .then((res) => {
        console.log("res00-00--0-00--0-0", res);
        setRefreshing(false);
        setPageSize(pageSize);

        pageNumber(refreshing ? page + 1 : 1);
        setTotalRecords(res.totalRecords);
        console.log("res", res.result);

        const data = res && res.result;
        if (page == 0) {
          storeHomeScreenCacheInfo(
            "instructor_activites",
            JSON.stringify({
              result: data,
            })
          );
        }
        // res.result
        //   .map((item) => ({
        //     ...item,
        //     // scheduler: {
        //     //   fromDate: item.scheduler.fromDate,
        //     //   status: item.scheduler.enabled,
        //     //   toDate: item.scheduler.toDate,
        //     // },
        //   }))
        //   .sort((a, b) => b.date - a.date);
        // console.log("data", data);
        if (refreshing) {
          setActivities({
            result: [...data, ...activities.result],
          });
          setOriginalActivities({
            result: [...data, ...originalActivities.result],
          });
        } else {
          setActivities({
            result: data,
          });
          setOriginalActivities({
            result: data,
          });
        }
        console.log("data9999999999", data);
      })
      .catch((err) => {
        setRefreshing(false);
        setPageSize(pageSize);

        pageNumber(page);
        console.log("getActivities Error:", err);
      });
  };

  const getActivitiesByUser = async (id: any, refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    FindActivitiesByUserId(id, refreshing ? page : 0, pageSize, {
      cancelToken: source.token,
    })
      .then((res) => {
        console.log("res", res);
        setTotalRecords(res.totalRecords);

        setRefreshing(false);
        setPageSize(pageSize);

        pageNumber(refreshing ? page + 1 : 1);

        const data = res && res.result;
        // &&
        // res.result
        //   .map((item) => ({
        //     ...item,
        //     // scheduler: {
        //     //   fromDate: item.scheduler.fromDate,
        //     //   status: item.scheduler.enabled,
        //     //   toDate: item.scheduler.toDate,
        //     // },
        //   }))
        //   .sort((a, b) => b.date - a.date);
        // console.log("data", data);
        if (page == 0) {
          storeHomeScreenCacheInfo(
            "instructor_activites",
            JSON.stringify({
              result: data,
            })
          );
        }
        if (refreshing) {
          setActivities({
            result: [...data, ...activities.result],
          });
          setOriginalActivities({
            result: [...data, ...originalActivities.result],
          });
        } else {
          setActivities({
            result: data,
          });
          setOriginalActivities({
            result: data,
          });
        }
      })
      .catch((err) => {
        console.log("getActivities user Error:", err);
        setRefreshing(false);
        setPageSize(pageSize);

        pageNumber(page);
      });
  };

  const getBuses = async () => {
    let id = await loadUserId();
    FindAllBus(id, 0, 10)
      .then((res) => {
        setBuses(res?.data?.result);
      })
      .catch((err) => {
        console.log("getBuses Error:", err);
      });
  };

  const getInstructors = async () => {
    GetAllInstructors(0, 10)
      .then((res) => {
        console.log("res", res);
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
        let res = await GetInstructor(userId);
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

        if (res?.isAdmin) {
          console.log("if------------------");
          await getActivities(false);
          await findInstructorBySchoolId(res);
        } else {
          console.log("else------------------");
          await getActivitiesByUser(userId);
        }
      } else {
        _dispatch({
          type: actions.INSTRUCTOR_DETAIL,
          payload: currentUser,
        });
        setUser(currentUser);
        if (currentUser?.isAdmin) {
          console.log("if------------------");
          await getActivities(false);
          await findInstructorBySchoolId(currentUser);
        } else {
          console.log("else------------------");
          await getActivitiesByUser(userId);
        }
      }

      if (!countries) {
        fetchCountries();
      }
    } catch (err) {
      console.log("err", err);
    }

    // GetInstructor(userId)
    //   .then(async (res) => {
    //     _dispatch({
    //       type: actions.INSTRUCTOR_DETAIL,
    //       payload: res,
    //     });
    //     console.log("res------------------", res);
    //     setUser(res);
    //     // if (res?.isAdmin) {
    //     //   console.log("if------------------");
    //     //   await getActivities(false);
    //     // } else {
    //     //   console.log("else------------------");
    //     //   await getActivitiesByUser(userId);
    //     // }
    //     // console.log("00currentuser", currentUser);
    //     // // getBuses();
    //     // FindInstructorBySchoolOrg({
    //     //   schoolId: res?.schoolId,
    //     //   // 2198,
    //     //   // res?.schoolId,
    //     //   orgId: res?.orgId || null,
    //     // })
    //     //   .then((instructors) => {
    //     //     _dispatch({
    //     //       type: actions.ORG_INSTRUCTORS,
    //     //       payload: { result: instructors },
    //     //     });
    //     //     setInstructors({ result: instructors });
    //     //     // setOrgInfo(org);
    //     //   })
    //     //   .catch((err) => console.log(err));
    //   })

    //   .catch((err) => {
    //     console.log("Error:", err);
    //   });
  };

  const getActivityByName = async () => {
    if (searchParam === "") {
      getActivities();
    } else {
      const _activities = await GetActivityByName(searchParam.toLowerCase());
      if (_activities) {
        setActivities({ result: _activities });
      }
    }
  };

  const getActivitiesByInstructor = async (id: number) => {
    console.log(id);
    GetActivityByInstructor(id, 0, pageSize, {
      cancelToken: source.token,
    })
      .then((res) => {
        filterInstructorActivities(
          selectedMonthForFilter,
          selectedDayForFilter,
          res
        );
      })
      .catch((err) => console.log("getActivitiesByInstructor"));
  };
  const getCacheActivites = async () => {
    let activites = await getHomeScreenCacheInfo("instructor_activites");
    if (activites) {
      setActivities(JSON.parse(activites));
      setOriginalActivities(JSON.parse(activites));
    }
  };
  // const controller = new AbortController();
  // const signal = controller.signal;
  const fetchCountries = async () => {
    try {
      console.log("usertype", countries);
      // if (!countries) {
      let res = await GetAllCountries({
        cancelToken: source.token,
      });
      //   dispatch(ChangeCountryState.action({ countries: res }));
      // }
    } catch (err) {
      console.log("err fetch coutnries", err);
    }
  };
  useEffect(() => {
    if (isFocused) {
      getCacheActivites();
    }
  }, [isFocused]);
  // useDebouncedEffect(
  //   async () => {
  //     if (
  //       searchParam &&
  //       searchParam !== previousSearchParam &&
  //       (searchParam.length === 0 || searchParam.length > 3)
  //     ) {
  //       getActivityByName();
  //     } else {
  //       const userId = await loadUserId();
  //       if (user?.isAdmin) {
  //         getActivities();
  //       } else {
  //         getActivitiesByUser(userId);
  //       }
  //     }
  //   },
  //   [searchParam, user],
  //   300
  // );

  useEffect(() => {
    if (isFocused) {
      // Alert.alert("kk");
      // if (countries) {
      // fetchCountries();
      getInstructor();
      // }
      if (currentUser?.instructorId) {
        // getBuses();
      }
    }
    return () => {
      source.cancel("axios request cancelled");
      // abortControllerRef.current.abort();
      // abortControllerRef = null;
    };
    // getInstructors();
  }, [isFocused]);

  // useEffect(() => {
  //   // const userType = await loadUserType();
  //   if (user) {
  //     getActivities();
  //   }
  //   // getBuses();
  // }, [isFocused]);

  // useEffect(() => {
  //   if (selectedActivity) {
  //     dispatch(ChangeModalState.action({ setupVehicleModal: true }));
  //   }
  // }, [selectedActivity]);

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
          // backgroundColor: "red",
          justifyContent: "center",
          paddingVertical: 3,
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
            setSelectedActivity(item);
            setVisible(true);
          }}
        >
          <FontAwesome5 size={35} name="th-large" color={Colors.primary} />
        </TouchableOpacity>
        {false && (
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              // backgroundColor: "yellow",
              height: "100%",
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
                    requestPermissionModalVisibility: true,
                  })
                );
                _dispatch({
                  type: actions.SET_SELECTED_ACTIVITY,
                  payload: item,
                });
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
                console.log(item, buses);
                const bus = buses.find(
                  (b) => b?.activityId === item?.activityId
                );
                console.log(bus);
                if (!!bus) {
                  _dispatch({
                    type: actions.SET_SELECTED_ACTIVITY,
                    payload: item,
                  });
                  dispatch(
                    ChangeModalState.action({ rollCallModalVisibility: true })
                  );
                } else {
                  setSelectedActivity(item);
                }
              }}
            >
              <Ionicons size={25} color={Colors.primary} name="checkbox" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                navigation.navigate("CreateActivity", {
                  isEdit: true,
                });
                _dispatch({
                  type: actions.SET_SELECTED_ACTIVITY,
                  payload: item,
                });
                if (prevOpenedRow) {
                  prevOpenedRow?.close();
                }
              }}
            >
              <Icon
                style={{ width: 25, height: 25 }}
                fill={Colors.primary}
                name="edit-2"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                if (prevOpenedRow) {
                  prevOpenedRow?.close();
                }
                navigation.navigate("ActivityDetails", {
                  activity: item,
                });
              }}
            >
              <Entypo size={25} color={Colors.primary} name="location-pin" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    journeyTrackerModalVisibility: true,
                  })
                );
                _dispatch({
                  type: actions.SET_SELECTED_ACTIVITY,
                  payload: item,
                });
                if (prevOpenedRow) {
                  prevOpenedRow?.close();
                }
              }}
            >
              <Entypo size={25} color={Colors.primary} name="clock" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
                // backgroundColor: "red",
              }}
              onPress={() => {
                if (prevOpenedRow) {
                  prevOpenedRow?.close();
                }
                navigation.navigate("CreateActivity", {
                  isEdit: false,
                });
                _dispatch({
                  type: actions.SET_SELECTED_ACTIVITY,
                  payload: item,
                });
              }}
            >
              <Feather size={25} color={Colors.primary} name="copy" />
            </TouchableOpacity>

            {!item.status && (
              <TouchableOpacity
                style={{
                  padding: 5,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() =>
                  DeleteActivity(item?.activityId)
                    .then((res) => {
                      console.log(res);
                      getActivities();
                    })
                    .catch((err) => console.log(err))
                }
              >
                <Icon
                  style={{ width: 25, height: 25 }}
                  fill={Colors.primary}
                  name="trash"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderIcon = (props: any) => <Icon {...props} name={"search"} />;
  const filterActivities = (month: any, day: any) => {
    let allActivities = { ...activities };

    let date = new Date().getFullYear() + "-" + month + "-" + day;
    console.log("date", date);
    let temp = [];
    originalActivities?.result?.map((item, index) => {
      let itemDate = item?.date.split("T");
      console.log("dsate----", moment(date).format("YYYY-MM-DD"));
      console.log("itemdate", itemDate[0]);

      if (itemDate[0] == moment(date).format("YYYY-MM-DD")) {
        temp.push(item);
      }
    });
    allActivities.result = temp;
    console.log("temp", temp);
    setActivities(allActivities);
  };
  const filterInstructorActivities = (
    month: any,
    day: any,
    activities: any
  ) => {
    let allActivities = [...activities];

    let date = new Date().getFullYear() + "-" + month + "-" + day;
    console.log("date", date);
    let temp = [];
    allActivities.map((item, index) => {
      let itemDate = item?.date?.split(" ");

      if (itemDate[0] == date) {
        temp.push(item);
      }
    });

    setSelectedInstructorActivities(temp);
  };
  useEffect(() => {
    if (isCalendarVisible) {
      filterActivities(selectedMonthForFilter, selectedDayForFilter);
    } else {
      setActivities(originalActivities);
    }
  }, [selectedDayForFilter, selectedMonthForFilter, isCalendarVisible]);
  const search = (text: String) => {
    let allActivities = { ...activities };

    let temp = originalActivities?.result?.filter((item, index) =>
      item.activityName.toLowerCase().includes(text.toLowerCase())
    );
    allActivities.result = temp;
    setActivities(allActivities);
  };
  // console.log("user--------", user);
  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const getActivityesCountApi = async (body: any) => {
    try {
      let res = await GetActivitesCount(body, {
        cancelToken: source.token,
      });
      let temp = {};
      res.map((item) => {
        temp[item.activityId] = item;
      });
      console.log("res", res);
      setActivitiesCount({ ...activitiesCount, ...temp });
    } catch (err) {
      console.log("err", err);
    }
  };
  console.log("activitiescount", activitiesCount);
  useEffect(() => {
    if (countries && isFocused) {
      let temp = [];
      if (activities?.result?.length > 0) {
        activities?.result?.forEach(async (element) => {
          temp.push(element.activityId);
          // await getActivityesCountApi(element?.activityId);
        });
        console.log("temp---", temp);
        getActivityesCountApi(temp);
      } else if (
        selectedInstructorActivities &&
        selectedInstructorActivities?.length > 0
      ) {
        selectedInstructorActivities?.forEach(async (element) => {
          temp.push(element.activityId);
          await getActivityesCountApi(element?.activityId);
        });
        console.log("temp---", temp);
        // getActivityesCountApi(temp);
      }
    }
  }, [
    activities?.result?.length || selectedInstructorActivities?.length,
    isFocused,
  ]);
  return (
    <>
      {cancelModal && (
        <CancelActivityModal
          prevOpenedRow={prevOpenedRow}
          row={row}
          item={selectedActivity}
          visible={cancelModal}
          hide={() => setCancelModal(false)}
          prevOpenedRow={prevOpenedRow}
          row={row}
          buses={buses}
          getActivities={getActivities}
        />
      )}
      {showStudentsInstructorsModal && (
        <ShowInstructorsStudentsModal
          isVisible={showStudentsInstructorsModal}
          setIsVisible={() => {
            setShowStudentsInstructorsModal(false);
          }}
          status={selectionData.status}
          type={selectionData.type}
        />
      )}
      {visible && (
        <InstructorActivitiesModal
          getActivities={getActivities}
          row={row}
          item={{
            ...selectedActivity,
            ...activitiesCount[selectedActivity.activityId],
          }}
          visible={visible}
          hide={() => setVisible(false)}
          showCancelModal={() => setCancelModal(true)}
          setSelectedActivity={(item: any) => setSelectedActivity(item)}
          prevOpenedRow={prevOpenedRow}
          buses={buses}
        />
      )}
      {showVehicle && (
        <SetupVehicleModal
          fromActivity={true}
          activity={selectedActivity}
          setActivity={setSelectedActivity}
          buses={buses}
          setBuses={setBuses}
        />
      )}
      {/* {<MarkAllRollCallModal />} */}

      {rollCallModal && (
        <RollCallModal
          buses={buses}
          setBuses={setBuses}
          activity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
        />
      )}
      {isVisible && (
        <RequestPermissionModal
          activity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
        />
      )}
      {showInstructorModal && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          activity={selectedActivity}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      {showJourneytracker && selectedActivity && (
        <JourneyTrackerModal user={user} selectedActivity={selectedActivity} />
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
              width: user && user.isAdmin ? "45%" : "90%",
              marginLeft: user && user.isAdmin ? "0%" : 0,
              marginTop: 10,
            }}
            placeholder="Search"
            accessoryLeft={renderIcon}
            onChangeText={(nextValue) => {
              //@ts-ignore
              search(nextValue);
              // setSearchParam(nextValue);
            }}
          />
          {/* user && !!user.isAdmin  */}
          {user && user.isAdmin && (
            <Select
              style={{ width: "50%", marginTop: -10 }}
              value={selectedInstructor}
              placeholder="Select Name"
              onSelect={(index: any) => {
                console.log("index", index);
                if (index.row === 0) {
                  setSelectedInstructor(null);
                  setSelectedInstructorActivities(null);
                } else {
                  setSelectedInstructor(
                    instructors?.result[index.row - 1]?.firstname +
                      " " +
                      instructors?.result[index.row - 1]?.lastname
                  );
                  getActivitiesByInstructor(
                    instructors?.result[index.row - 1]?.instructorId
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
            selectedInstructorActivities
              ? selectedInstructorActivities
              : (activities && activities?.result) || []
          }
          style={{
            padding: 10,
            width: "100%",
            marginTop: 10,
            marginBottom: 20,
          }}
          renderItem={({ item, index }) => {
            let date = item?.date.split(" ");
            console.log("date", date);
            let temp = [];
            let instructor = item?.instructors?.map((item) =>
              temp.push(item?.firstName)
            );

            return (
              <Swipeable
                ref={(ref) => (row[index] = ref)}
                // ref={swipeableRef}
                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={(e) => RightActions(e, item, index)}
              >
                <TouchableOpacity
                  onPress={() => {
                    // _dispatch({
                    //     type: actions.SET_SELECTED_ACTIVITY,
                    //     payload: item,
                    // })
                    // dispatch(
                    //     ChangeModalState.action({ rollCallModalVisibility: true }),
                    // )
                    // navigation.navigate('InstructorGroupApproval')
                  }}
                  style={[
                    styles.item,
                    {
                      backgroundColor: !item?.status
                        ? "#fff"
                        : index % 3 === 0
                        ? "lightgreen"
                        : index % 2 === 0
                        ? "#F6DDCC"
                        : "#fff",
                    },
                  ]}
                >
                  <Text style={styles.text}>{`Date: ${moment(
                    date == "string" ? new Date() : date[0]
                  ).format("YYYY-MM-DD")}`}</Text>
                  {!date[1] ? (
                    <Text style={styles.text}>{`Time: ${moment(
                      date == "string" ? new Date() : date
                    )
                      .subtract("hours", 5)
                      .format("hh:mm a")}`}</Text>
                  ) : (
                    <Text style={styles.text}>{`Time: ${
                      date[2] + " " + date[3]
                    }`}</Text>
                  )}
                  <Text style={styles.text}>{`${
                    item?.activityType?.toLowerCase() === "activity"
                      ? "Activity"
                      : "Trip"
                  }: ${item?.activityName}`}</Text>
                  <Text
                    style={styles.text}
                  >{`Where: ${item?.venueFromName}`}</Text>
                  <Text
                    style={styles.text}
                  >{`Address: ${item?.venueFromAddress}`}</Text>
                  <Text style={styles.text}>{`Status: ${
                    item?.status ? "Active" : "Inactive"
                  }`}</Text>
                  {/* <Text style={styles.text}>{`Students: ${
                    (item?.studentsActivity &&
                      item?.studentsActivity?.length) ||
                    0
                  }`}</Text> */}
                  <Text
                    style={[styles.text, { width: "100%" }]}
                  >{`Instructors: ${temp.toString()}`}</Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.horizontal}
                      onPress={() => {
                        _dispatch({
                          type: actions.SET_SELECTED_ACTIVITY,
                          payload: item,
                        });
                        setSelectionData({
                          status: "approved",
                          type: "student",
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>{`Approval: ${
                        activitiesCount[item.activityId]
                          ?.countApprovedStudents || "0"
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
                        _dispatch({
                          type: actions.SET_SELECTED_ACTIVITY,
                          payload: item,
                        });
                        setSelectionData({
                          status: "approved",
                          type: "instructor",
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        {activitiesCount[item.activityId]
                          ?.countApprovedInstructors || "0"}
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
                        _dispatch({
                          type: actions.SET_SELECTED_ACTIVITY,
                          payload: item,
                        });
                        setSelectionData({
                          status: "declined",
                          type: "student",
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>{`Declined: ${
                        activitiesCount[item.activityId]
                          ?.countDeclinedStudents || "0"
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
                        _dispatch({
                          type: actions.SET_SELECTED_ACTIVITY,
                          payload: item,
                        });
                        setSelectionData({
                          status: "declined",
                          type: "instructor",
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        {activitiesCount[item.activityId]
                          ?.countDeclinedInstructors || "0"}
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
                      onPress={() => {
                        _dispatch({
                          type: actions.SET_SELECTED_ACTIVITY,
                          payload: item,
                        });
                        setSelectionData({
                          status: "pending",
                          type: "student",
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                      style={styles.horizontal}
                    >
                      <Text style={styles.text}>
                        {`Pending:  ${
                          activitiesCount[item.activityId]
                            ?.countPendingStudents || "0"
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
                        _dispatch({
                          type: actions.SET_SELECTED_ACTIVITY,
                          payload: item,
                        });
                        setSelectionData({
                          status: "pending",
                          type: "instructor",
                        });
                        setShowStudentsInstructorsModal(true);
                      }}
                    >
                      <Text style={styles.text}>
                        {activitiesCount[item.activityId]
                          ?.countPendingInstructors || "0"}
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
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedActivity(item);
                    setSelectedInstructions(item?.optin);
                    dispatch(
                      ChangeModalState.action({
                        instructionsModalVisibility: true,
                      })
                    );
                  }}
                  style={[
                    styles.footer,
                    {
                      backgroundColor: !item?.status
                        ? "#fff"
                        : index % 3 === 0
                        ? "lightgreen"
                        : index % 2 === 0
                        ? "#F6DDCC"
                        : "#fff",
                    },
                  ]}
                >
                  <Text
                    style={styles.text}
                  >{`Instructions / Disclaimer / Agreement`}</Text>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
          onEndReached={async () => {
            console.log("logs", originalActivities.result.length);

            console.log("logs", totalRecords);
            if (totalRecords > originalActivities.result.length) {
              console.log("logs");
              const userId = await loadUserId();
              user?.isAdmin ? getActivities(true) : getActivitiesByUser(userId);
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
        onPress={() => {
          navigation.navigate("CreateActivity");
          _dispatch({
            type: actions.SET_SELECTED_ACTIVITY,
            payload: false,
          });
        }}
      >
        <AntDesign name="pluscircle" size={50} color={Colors.primary} />
      </TouchableOpacity>
    </>
  );
};

export default InstructorActivityScreen;

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
