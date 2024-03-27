import { AppHeader } from '@/Components';
import { actions } from '@/Context/state/Reducer';
import { useStateValue } from '@/Context/state/State';
import {
  CancelActivityModal,
  InstructionsModal,
  InstructorActivitiesModal,
  JourneyTrackerModal,
  RequestPermissionModal,
  RollCallModal,
  SetupVehicleModal,
  ShowInstructorsStudentsModal,
} from '@/Modals';
import { Activity, Optin } from '@/Models/DTOs';
import { FindActivitiesByUserId, GetActivitesCount, GetActivityByName, GetAllActivity } from '@/Services/Activity';
import GetActivityByInstructor from '@/Services/Activity/GetActivityByInstructor';
import { GetInstructor } from '@/Services/Instructor';
import CreateMultipleInstructor from '@/Services/Instructor/CreateMultipleInstructor';
import { GetAllCountries } from '@/Services/PlaceServices';
import {
  getHomeScreenCacheInfo,
  getOrgInstructors,
  loadId,
  loadToken,
  loadUserId,
  removeInstructors,
  storeHomeScreenCacheInfo,
} from '@/Storage/MainAppStorage';
import { InstructorState } from '@/Store/InstructorsActivity';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import ChangeNavigationCustomState from '@/Store/Navigation/ChangeNavigationCustomState';
import { PlaceState } from '@/Store/Places';
import { UserState } from '@/Store/User';
import ChangeUserState from '@/Store/User/FetchOne';
import Colors from '@/Theme/Colors';
import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Text } from '@ui-kitten/components';
import axios from 'axios';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import GeolocationAndroid from 'react-native-geolocation-service';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useDispatch, useSelector } from 'react-redux';
import { UserTypeState } from '@/Store/UserType';
import { InstructorActivityNavigatorParamList } from '@/Navigators/Main/InstructorActivityNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
// todo solve problem with Stomp
// import SockJS from "sockjs-client";
// import * as Stomp from "stompjs";
const studentImage = require("@/Assets/Images/approval_icon1.png");
const instructorImage = require("@/Assets/Images/approval_icon2.png");


type InstructorActivityScreenProps = {
  route: RouteProp<InstructorActivityNavigatorParamList, 'InstructorActivity'>;
};

const InstructorActivityScreen: FC<InstructorActivityScreenProps> = ({ route }) => {
  const [, _dispatch]: any = useStateValue();
  // const countries = useSelector(
  //   (state: { state: any }) => state.places.countries
  // );
  const instructors = route?.params?.instructors;
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  // const { abortControllerRef } = abortController();
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  // let abortControllerRef = useRef<AbortController>(new AbortController());
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const isFocused = useIsFocused();
  // const swipeableRef = useRef(null);
  const [activitiesCount, setActivitiesCount] = useState<any>({});
  const dispatch = useDispatch();
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType
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
  const searchBarValue = useSelector(
    (state: any) => state.header.searchBarValue
  );
  const dropDownValue = useSelector((state: any) => state.header.dropDownValue);

  const [cancelModal, setCancelModal] = useState<boolean>(false);
  const [searchParam, setSearchParam] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]|  any>([]);
  const [originalActivities, setOriginalActivities] = useState<Activity[]| any>([]);

  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin| null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<string| null>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [page, pageNumber] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [userId, setUserId] = useState<string| null>(null);
  const [selectedInstructorActivities, setSelectedInstructorActivities] =
    useState<any>(null);
    const [originalInstructorActivities, setOriginalInstructorActivities] =
    useState<any>(null);
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
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

  const getActivities = async (refreshing?: any) => {
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

  const getActivitiesByUser = async (id: any, refreshing?: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    FindActivitiesByUserId(id, refreshing ? page : 0, pageSize, {
      cancelToken: source.token,
    })
      .then((res) => {
        console.log("FindActivitiesByUserId", res);
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
    if(userId) {
      setUserId(userId);
    }
    try {
      if (Object.keys(currentUser).length == 0) {
        if (!userId) return
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
        if ((currentUser as any)?.isAdmin) {
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

  const getActivitiesByInstructor = async (id: any) => {
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
      let res = await GetAllCountries();
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
  // todo solve problem witn Stomp
  // let stompClient: any = React.createRef<Stomp.Client>();
  // const connectSockets = async () => {
  //   const token = await loadToken();
  //   const socket = new SockJS("https://live-api.trackmykidz.com/ws-location");
  //   stompClient = Stomp.over(socket);
  //   stompClient.connect({ token }, () => {
  //     console.log("Connected");
  //     locationPermission(true);
  //   });
  // };
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
    // todo solve problem with Stomp
    // stompClient.send(
    //   "/socket/ws-location",
    //   { token },
    //   JSON.stringify({
    //     latitude: lat,
    //     longitude: lang,
    //     deviceId: currentUser?.deviceId,
    //   })
    // );
  };

  const handleHistorySchedule = async () => {
    // if (currentUser?.childTrackHistory) {
    try {
      if (Platform.OS == "android") {
        GeolocationAndroid.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          console.log("crd", crd);

          sendCoordinates(crd.latitude, crd.longitude);
        });
      } else {
        Geolocation.getCurrentPosition(async (pos: { coords: any }) => {
          const crd = pos.coords;

          sendCoordinates(crd.latitude, crd.longitude);
        }, ()=>{},()=>{});
      }
    } catch (err) {
      console.log("er99999999999999", err);
    }

    // }
  };
  const backgroundCall = async () => {
    const sleep = (time: any) =>
      new Promise((resolve: any) => setTimeout(() => resolve(), time));

    // You can do anything in your task such as network requests, timers and so on,
    // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
    // React Native will go into "paused" mode (unless there are other tasks running,
    // or there is a foreground app).
    const veryIntensiveTask = async (taskDataArguments: any) => {
      // Example of an infinite loop task
      const { delay } = taskDataArguments;

      await new Promise(async () => {
        for (let i = 1; BackgroundService.isRunning(); i++) {
          try {
            // depends on which lib you are using
            await handleHistorySchedule();
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
  const RightActions = (dragX: any, item: any) => {
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
      let allActivities = { ...activities }

    let date = new Date().getFullYear() + "-" + month + "-" + day;
    let temp: any[] = [];
    if(originalInstructorActivities?.length){
      originalInstructorActivities.map((item: any)=>{

        const date1 = moment(item?.fromDate, ["YYYY-MM-DDTHH:mm:ss.SSSZ", "MMM DD, YYYYTHH:mm:ss.SSSZ"],true);
        const date2 = moment(date, ["YYYY-M-D"],true).add(1,'month').add(1,'day');
        console.log('date1: ', date1)
        console.log('date2: ', date2)
        if (
          moment(date1).isSame(date2,'day') &&
          moment(date1).isSame(date2,'month')
        ) {
          temp.push(item);
        }
      })
      setSelectedInstructorActivities(temp)
    }else{
 originalActivities?.result?.map((item: any, index: number) => {
      // let itemDate = item?.date.split("T");

      if (
        moment(item?.fromDate).format('MMM DD, YYYY') ==
        moment(date).format('MMM DD, YYYY')
      ) {
        temp.push(item);
      }
    });
    }

    allActivities.result = temp;

    setActivities(allActivities);


  };
  const filterInstructorActivities = (
    month: any,
    day: any,
    activities: any
  ) => {
    let allActivities = [...activities];

    if(!isCalendarVisible){
      setSelectedInstructorActivities(activities)
      setOriginalInstructorActivities(activities);
    } else{
      let date = new Date().getFullYear() + "-" + month + "-" + day;
      let temp: any[] = [];
      allActivities.map((item, index) => {
        let itemDate = item?.date?.split(" ");

        if (itemDate[0] == date) {
          temp.push(item);
        }
      });
      setSelectedInstructorActivities(temp);
    }

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

    allActivities.result = originalActivities?.result?.filter((item: any, index: number) =>
      item.activityName.toLowerCase().includes(text.toLowerCase())
    );
    setActivities(allActivities);
  };
  // console.log("user--------", user);
  const closeRow = (index: number) => {
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
      let temp: any = {};
      res.map((item: any) => {
        temp[item.activityId] = item;
      });
      console.log("res", res);
      setActivitiesCount({ ...activitiesCount, ...temp });
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(()=>{
if(!isCalendarVisible){
  if( user_type === 'instructor')
  setSelectedInstructorActivities(originalInstructorActivities)
}
  },[isCalendarVisible])

  useEffect(() => {
    if (countries && isFocused) {
      let temp: any = [];
      if (activities?.result?.length > 0) {
        activities?.result?.forEach(async (element:any) => {
          temp.push(element.activityId);
          // await getActivityesCountApi(element?.activityId);
        });

        getActivityesCountApi(temp);
      } else if (
        selectedInstructorActivities &&
        selectedInstructorActivities?.length > 0
      ) {
        selectedInstructorActivities?.forEach(async (element: any) => {
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
    }else if (userId){
      getActivitiesByInstructor(
        userId
      );
    }
  }, [dropDownValue,userId]);
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
          // todo check if it works
          // activity={selectedActivity}
          // setSelectedActivity={setSelectedActivity}
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
        {
        (activities?.result?.length == 0 && selectedInstructorActivities?.length == 0) && (
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
            // let temp = [];
            // let instructor = item?.instructors?.map((item) =>
            //   temp.push(item?.firstName)
            // );
            // console.log("activity", item);
            return (
              <Swipeable
                ref={(ref) => (row[index] = ref)}
                // ref={swipeableRef}

                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={(e) => RightActions(e, item)}
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
                        <Text style={styles.text}>{`${moment.utc(
                          item?.fromDate == "string"
                            ? new Date()
                            : item?.fromDate
                        ).format('MMM DD, YYYY')} at ${moment.utc(
                          item?.fromDate == "string"
                            ? new Date()
                            : item?.fromDate
                        ).format("hh:mm a")} `}</Text>
                        <Text style={styles.text}>{`${moment(
                          item?.toDate == "string" ? new Date() : item?.toDate
                        ).format('MMM DD, YYYY')} at ${moment.utc(
                          item?.toDate == "string" ? new Date() : item?.toDate
                        )
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
                    <View
                      style={{
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.footerText}>{`Approved`}</Text>
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
            if (totalRecords > originalActivities?.result?.length) {
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
    // height: 175,
    paddingBottom:10
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
    fontSize: 14,
    marginVertical: 4,
  },

  iconImages: {
    height: 18,
    width: 18,
    resizeMode: "contain",
    marginLeft: 5,
    marginRight: 5,
  },
  footerText: {
    fontSize: 14,
    marginVertical: 2,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
});
