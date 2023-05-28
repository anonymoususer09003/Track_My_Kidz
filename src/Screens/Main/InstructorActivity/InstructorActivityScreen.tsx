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
  PermissionsAndroid,
  Platform,
  Image,
} from "react-native";
import * as Stomp from "stompjs";
import BackgroundService from "react-native-background-actions";
import Geolocation from "@react-native-community/geolocation";
import GeolocationAndroid from "react-native-geolocation-service";
import SockJS from "sockjs-client";
import { loadToken } from "@/Storage/MainAppStorage";
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
  getOrgInstructors,
  removeInstructors,
  storeInstructors,
  loadUserType,
  storeHomeScreenCacheInfo,
  getHomeScreenCacheInfo,
} from "@/Storage/MainAppStorage";
import CreateMultipleInstructor from "@/Services/Instructor/CreateMultipleInstructor";
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
import { AppHeader } from "@/Components";
const studentImage = require("@/Assets/Images/approval_icon1.png");
const instructorImage = require("@/Assets/Images/approval_icon2.png");
const InstructorActivityScreen = ({ route }: any) => {
  const [, _dispatch] = useStateValue();
  // const countries = useSelector(
  //   (state: { state: any }) => state.places.countries
  // );
  const instructors = route?.params?.instructors;
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

  const showVehicle = useSelector(
    (state: { modal: ModalState }) => state.modal.setupVehicleModal
  );
  const showJourneytracker = useSelector(
    (state: { modal: ModalState }) => state.modal.journeyTrackerModalVisibility
  );
  const rollCallModal = useSelector(
    (state: { modal: ModalState }) => state.modal.rollCallModalVisibility
  );
  const searchBarValue = useSelector(
    (state: any) => state.header.searchBarValue
  );
  const dropDownValue = useSelector((state: any) => state.header.dropDownValue);

  const [cancelModal, setCancelModal] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const previousSearchParam = usePrevious(searchParam);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [originalActivities, setOriginalActivities] = useState<Activity[]>([]);

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
  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );
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
  const setOrgInstructors = async () => {
    try {
      let res = await getOrgInstructors();
      if (res) {
        const userId = await loadId();
        await CreateMultipleInstructor(JSON.parse(res), userId);
        removeInstructors();
      }
    } catch (err) {}
  };
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

  const getInstructor = async () => {
    const userId = await loadUserId();

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

  const fetchCountries = async () => {
    try {
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
      setOrgInstructors();
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
  let stompClient: any = React.createRef<Stomp.Client>();
  const connectSockets = async () => {
    const token = await loadToken();
    const socket = new SockJS("https://live-api.trackmykidz.com/ws-location");
    stompClient = Stomp.over(socket);
    stompClient.connect({ token }, () => {
      console.log("Connected");
      locationPermission(true);
    });
  };
  const locationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: "Background Location Permission",
          message: "TrackMyKidz App needs access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      // );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        backgroundCall();
      } else {
        backgroundCall();
      }
    } else {
      backgroundCall();
      // backgroundCall();
    }
    // handleTrackHistorySchedule();
  };

  const sendCoordinates = async (lat: any, lang: any) => {
    const token = await loadToken();
    stompClient.send(
      "/socket/ws-location",
      { token },
      JSON.stringify({
        latitude: lat,
        longitude: lang,
        deviceId: currentUser?.deviceId,
      })
    );
  };

  const handleHistorySchedule = async (tracking) => {
    // if (currentUser?.childTrackHistory) {
    try {
      if (Platform.OS == "android") {
        GeolocationAndroid.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          console.log("crd", crd);

          sendCoordinates(crd.latitude, crd.longitude);
        });
      } else {
        Geolocation.getCurrentPosition(async (pos) => {
          const crd = pos.coords;

          sendCoordinates(crd.latitude, crd.longitude);
        });
      }
    } catch (err) {
      console.log("er99999999999999", err);
    }

    // }
  };
  const backgroundCall = async (tracking) => {
    const sleep = (time) =>
      new Promise((resolve) => setTimeout(() => resolve(), time));

    // You can do anything in your task such as network requests, timers and so on,
    // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
    // React Native will go into "paused" mode (unless there are other tasks running,
    // or there is a foreground app).
    const veryIntensiveTask = async (taskDataArguments) => {
      // Example of an infinite loop task
      const { delay } = taskDataArguments;

      await new Promise(async () => {
        for (let i = 1; BackgroundService.isRunning(); i++) {
          try {
            // depends on which lib you are using
            await handleHistorySchedule(tracking);
          } catch (error) {
            // console.log(error);
          }
          await sleep(2000);
        }
      });

      // await sleep(delay);
    };

    const options = {
      taskName: "Example",
      taskTitle: "TrackMyKidz",
      taskDesc: "Tracking your Location",
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      color: "#ff00ff",
      linkingURI: "yourSchemeHere://chat/jane", // See Deep Lking for more info
      parameters: {
        delay: 2000,
      },
    };
    BackgroundService.on("expiration", () => {
      console.log("I am being closed :(");
    });

    // await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({
      taskDesc: "Tracking Location",
    }); // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
    // await BackgroundService.stop();
  };

  useEffect(() => {
    if (isFocused) {
      // connectSockets();
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
      // let itemDate = item?.date.split("T");
      console.log("dsate----", moment(item?.fromDate).format("YYYY-MM-DD")); // console.log("itemdate", itemDate[0]);

      if (
        moment(item?.fromDate).format("YYYY-MM-DD") ==
        moment(date).format("YYYY-MM-DD")
      ) {
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

        getActivityesCountApi(temp);
      } else if (
        selectedInstructorActivities &&
        selectedInstructorActivities?.length > 0
      ) {
        selectedInstructorActivities?.forEach(async (element) => {
          temp.push(element.activityId);
          await getActivityesCountApi(element?.activityId);
        });

        // getActivityesCountApi(temp);
      }
    }
  }, [
    activities?.result?.length || selectedInstructorActivities?.length,
    isFocused,
  ]);
  const CalendarModalTrigger = () => {
    dispatch(
      ChangeModalState.action({
        showCalendar: isCalendarVisible ? false : true,
      })
    );
  };
  useEffect(() => {
    if (dropDownValue) {
      if (dropDownValue.row === 0) {
        setSelectedInstructor(null);
        setSelectedInstructorActivities(null);
      } else {
        setSelectedInstructor(
          instructors?.result[dropDownValue.row - 1]?.firstname +
            " " +
            instructors?.result[dropDownValue.row - 1]?.lastname
        );
        getActivitiesByInstructor(
          instructors?.result[dropDownValue.row - 1]?.instructorId
        );
      }
    }
  }, [dropDownValue]);
  useEffect(() => {
    if (searchBarValue) {
      search(searchBarValue);
    } else {
      setActivities(originalActivities);
    }
  }, [searchBarValue]);
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
        {activities.length == 0 && (
          <Text style={{ textAlign: "center", marginTop: 5 }}>
            You currently do not have any activities
          </Text>
        )}
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
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => {
            let temp = [];
            let instructor = item?.instructors?.map((item) =>
              temp.push(item?.firstName)
            );
            // console.log("activity", item);
            return (
              <Swipeable
                ref={(ref) => (row[index] = ref)}
                // ref={swipeableRef}

                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={(e) => RightActions(e, item, index)}
              >
                <View
                  style={[
                    styles.item,
                    {
                      backgroundColor: "#fff",
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("InstructorActivityDetail", {
                        data: item,
                        activitiesCount: activitiesCount,
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 20,
                          fontWeight: "800",
                          paddingLeft: 25,
                        },
                      ]}
                    >
                      {item?.activityName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingBottom: 20,
                        borderBottomWidth: 0.5,
                        paddingHorizontal: 10,
                        borderColor: Colors.borderGrey,
                      }}
                    >
                      <Image
                        source={require("@/Assets/Images/circle-dashed.png")}
                        style={{
                          height: 40,
                          width: 40,
                          resizeMode: "contain",
                          // marginRight: 10,
                        }}
                      />
                      <View>
                        <Text style={styles.text}>{`${moment(
                          item?.fromDate == "string"
                            ? new Date()
                            : item?.fromDate
                        ).format("YYYY-MM-DD")} at ${moment(
                          item?.fromDate == "string"
                            ? new Date()
                            : item?.fromDate
                        )
                          .subtract("hours", 5)
                          .format("hh:mm a")} `}</Text>
                        <Text style={styles.text}>{`${moment(
                          item?.toDate == "string" ? new Date() : item?.toDate
                        ).format("YYYY-MM-DD")} at ${moment(
                          item?.toDate == "string" ? new Date() : item?.toDate
                        )
                          .subtract("hours", 5)
                          .format("hh:mm a")} `}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.text}>{`Approval`}</Text>
                      <View style={{ flexDirection: "row" }}>
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
                          <Text style={styles.footerText}>{`${
                            activitiesCount[item.activityId]
                              ?.countApprovedStudents || "0"
                          }`}</Text>
                          <Entypo
                            name="book"
                            color={Colors.primary}
                            size={15}
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
                          <Image
                            source={instructorImage}
                            style={styles.iconImages}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.footerText}>{`Declined`}</Text>
                      <View style={{ flexDirection: "row" }}>
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
                          <Text style={styles.text}>{`${
                            activitiesCount[item.activityId]
                              ?.countDeclinedStudents || "0"
                          }`}</Text>
                          <Entypo
                            name="book"
                            color={Colors.primary}
                            size={15}
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
                          <Image
                            source={instructorImage}
                            style={styles.iconImages}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.footerText}>{`Pending`}</Text>
                      <View style={{ flexDirection: "row" }}>
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
                            {`${
                              activitiesCount[item.activityId]
                                ?.countPendingStudents || "0"
                            }`}
                          </Text>
                          <Entypo
                            name="book"
                            color={Colors.primary}
                            size={15}
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
                          <Image
                            source={instructorImage}
                            style={styles.iconImages}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            );
          }}
          onEndReached={async () => {
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

      <AppHeader
        onAddPress={() => {
          navigation.navigate("CreateActivity");
          _dispatch({
            type: actions.SET_SELECTED_ACTIVITY,
            payload: false,
          });
        }}
      />
    </>
  );
};

export default InstructorActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 15,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    // paddingHorizontal: 10,
    paddingTop: 10,
    height: 175,
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
    fontSize: 13,
    marginVertical: 4,
  },

  iconImages: {
    height: 15,
    width: 15,
    resizeMode: "contain",
    marginLeft: 5,
    marginRight: 5,
  },
  footerText: {
    fontSize: 13,
    marginVertical: 2,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
});
