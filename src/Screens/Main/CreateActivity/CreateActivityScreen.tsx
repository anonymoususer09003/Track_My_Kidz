import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Datepicker,
  CheckBox,
  Autocomplete,
  AutocompleteItem,
} from "@ui-kitten/components";
import * as yup from "yup";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import fetchOneUserService from "@/Services/User/FetchOne";
import ChangeUserState from "@/Store/User/FetchOne";
import { GetGroup } from "@/Services/Group";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradientButton } from "@/Components";
import { AddIndividialMembersModal, GroupSelectionModal } from "@/Modals";
import { Formik } from "formik";
import { AppHeader } from "@/Components";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CreateGroup } from "@/Services/Group";
import {
  CreateActivity,
  UpdateActivity,
  GetActivity,
  GetOptIn,
  DeleteActivityParticipants,
} from "@/Services/Activity";
import { loadUserId } from "@/Storage/MainAppStorage";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import moment from "moment";
import { PlaceState } from "@/Store/Places";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { UserState } from "@/Store/User";
import FetchOne from "@/Services/User/FetchOne";
import CreateMultipleInstructor from "@/Services/Instructor/CreateMultipleInstructor";
import {
  GetAllInstructors,
  FindInstructorBySchoolOrg,
  GetInstructor,
} from "@/Services/Instructor";
import NotifyToParent from "@/Services/Activity/NotifyToParent";
import NotifyToInstructors from "@/Services/Activity/NotifyToInstructors";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";

const _days = [
  {
    id: 1,
    name: "Mon",
    selected: false,
  },
  {
    id: 1,
    name: "Tue",
    selected: false,
  },
  {
    id: 1,
    name: "Wed",
    selected: false,
  },
  {
    id: 1,
    name: "Thu",
    selected: false,
  },
  {
    id: 1,
    name: "Fri",
    selected: false,
  },
  {
    id: 1,
    name: "Sat",
    selected: false,
  },
  {
    id: 1,
    name: "Sun",
    selected: false,
  },
];

const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

const timeStamp = [
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
  "12:00 AM",
  "12:30 AM",
];

const CreateActivityScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const validationSchema = yup.object().shape({
    fromVenueName: yup.string().required("Venue name is required"),
    fromAddress: yup.string().required("Address is required"),
  });
  const navigation = useNavigation();
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  console.log("currentUser", currentUser);
  const [orgId, setOrgId] = useState({});
  const [hideForm, setHideForm] = useState(true);

  const [{ selectedActivity: activity }, _dispatch] = useStateValue();
  const isEdit = route?.params?.isEdit || false;
  const dispatch = useDispatch();
  const [days, setDays] = useState(_days);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeSelectedIndex, setTimeSelectedIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState("");
  const [askPermission, setAskPermission] = useState(
    activity?.requestPermission || false
  );

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [optIn, setOptIn] = useState({});
  const [instructorsList, setInstructorList] = useState([]);
  const [onBehalf, setOnBehalf] = useState("");
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [user, setUser] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [infomation, setInformation] = useState({});
  const [groupInfo, setGroupInfo] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [instructorInfo, setInstructorInfo] = useState({});
  const [deletedInstructors, setDeletedInstructors] = useState([]);

  const [deletedStudents, setDeletedStudents] = useState([]);
  // console.log(user);

  // const getInstructors = async () => {
  //   const userId = await loadUserId();
  //   GetInstructor(userId).then((res) => {
  //     setInstructorInfo(res);
  //     FindInstructorBySchoolOrg({
  //       schoolId: res?.schoolId,

  //       // 2198,

  //       orgId: res?.orgId || null,
  //     })
  //       .then((instructors) => {
  //         setUser(res);
  //         console.log("onBhelaf of", instructors);
  //         if (activity) {
  //           let _ins = instructors?.find(
  //             (i) => i?.instructorId == activity.onBehalfOf
  //           );
  //           // console.log("_ins====================", _ins);
  //           setOnBehalf(_ins ? _ins?.firstname + " " + _ins?.lastname : "");
  //         }

  //         setInstructors({ result: instructors });
  //         // setOrgInfo(org);
  //       })
  //       .catch((err) => console.log(err));
  //   });
  // }

  const findInstructorBySchoolId = async (res: any) => {
    try {
      setInstructorInfo(res);
      let instructors = await FindInstructorBySchoolOrg({
        schoolId: res?.schoolId,
        // 2198,
        // res?.schoolId,
        orgId: res?.orgId || null,
      });
      setOrgId({ schoolId: res?.schoolId || null, orgId: res?.orgId || null });
      setUser(res);
      console.log("onBhelaf of", instructors);
      if (activity) {
        let _ins = instructors?.find(
          (i) => i?.instructorId == activity.onBehalfOf
        );
        // console.log("_ins====================", _ins);
        setOnBehalf(_ins ? _ins?.firstname + " " + _ins?.lastname : "");
      }

      setInstructors({ result: instructors });

      // setOrgInfo(org);
      //   })
    } catch (err) {
      console.log("err", err);
    }
  };

  const getInstructors = async () => {
    const userId = await loadUserId();
    console.log("instructor------------------", userId);
    try {
      if (!currentUser) {
        let res = await GetInstructor(userId);
        console.log("res", res);
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

        findInstructorBySchoolId(res);
      } else {
        setInstructorInfo(currentUser);
        findInstructorBySchoolId(currentUser);

        setUser(currentUser);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  // const getInstructors = async () => {
  //   GetAllInstructors(0, 20)
  //     .then((res) => {
  //       setInstructors(res);
  //     })
  //     .catch((err) => {});
  // };

  const loadUserDetails = async () => {
    FetchOne().then((res) => {
      setUser(res);
    });
  };

  const handleRemoveStudent = (item) => {
    let data = [...students];
    data = data.filter((d) => d.parent1_email !== item.parent1_email);
    if (item?.isEdit) {
      setDeletedStudents([...deletedStudents, item]);
    }
    setStudents(data);
  };
  const handleRemoveInstructors = (item) => {
    let data = [...instructorsList];
    data = data.filter((d) => d?.instructorId !== item?.instructorId);
    if (item?.isEdit) {
      setDeletedInstructors([...deletedInstructors, item]);
    }
    setInstructorList(data);
  };
  console.log("deleted students", deletedStudents);
  const handleRemoveGroup = (item) => {
    let data = [...groups];
    data = data.filter((d) => d.groupName !== item.groupName);
    setGroups(data);
  };

  const handleStudentAutoSelect = () => {
    if (activity?.studentsActivity) {
      const data = activity?.studentsActivity?.map((item) => ({
        name: item?.firstName + " " + item?.lastName,
        email: item?.email || "",
        parent1_email: item.parentEmail1,
        parent2_email: item.parentEmail2,
      }));
      setStudents(data);
    }
  };

  const getActivityDetail = () => {
    GetActivity(activity?.activityId)
      .then((res) => {
        console.log("res099090900900909", res);

        let students = res?.students?.map((item) => ({
          name: item?.firstName + " " + item.lastName,
          id: item?.studentActivityId,
          isEdit: true,
          parent1_email: item.parentEmail1,
          parent2_email: item.parentEmail2,
        }));
        let instructors = res?.instructors?.map((item, index) => ({
          firstname: item?.firstName,
          lastname: item?.lastName,
          email: item?.email,
          isEdit: true,
          instructorId: item?.instructorActivityId,
        }));
        console.log("instructors", instructors);
        setInstructorList(instructors);
        setStudents(students);
        setInformation({ ...infomation, ...res });
        setHideForm(true);
        // setActivityDetail(res);
      })
      .catch((err) => {
        setHideForm(true);
        console.log("err-----", err);
      });
  };
  const getGroupDetail = async (id: any) => {
    GetGroup(id || route?.params?.groupId)
      .then((res) => {
        console.log("groupinfo", res);

        let students = res?.studentsGroup?.map((item) => ({
          name: item?.firstName + " " + item.lastName,

          parent1_email: item.parentEmail1,
          parent2_email: item.parentEmail2,
        }));
        let instructors = res?.instructorsGroup?.map((item, index) => ({
          firstname: item?.firstName,
          lastname: item?.lastName,
          email: item?.email,
          instructorId: index + 1,
        }));
        console.log("instructors", instructors);
        setInstructorList(instructors);
        setStudents(students);
        setStatesData(students);
        setGroupInfo(res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const getActivityOptInDetail = async () => {
    try {
      let res = await GetOptIn(activity?.activityId);
      setOptIn({ ...infomation, ...res });
      setInformation({ ...infomation, ...res });
    } catch (err) {
      setHideForm(true);
      console.log("err", err);
    }
  };

  // console.log("venue state------------", currentUser?.state);
  useEffect(() => {
    // loadUserDetails();
    if (isFocused) {
      getInstructors();
      handleStudentAutoSelect();
      if (route?.params?.groupId) {
        getGroupDetail();
      }
    }
  }, [isFocused]);
  useEffect(() => {
    if (!isFocused) {
      // setStudents([]);
      setInstructorList([]);
      // Alert.alert("jj");
      _dispatch({
        type: actions.SET_SELECTED_ACTIVITY,
        payload: null,
      });
      setInformation({});
      setStatesData([]);
      setStudents([]);
      setInstructorList([]);
      setHideForm(false);
      setDeletedStudents([]);
      setDeletedInstructors([]);
    } else {
      if (isFocused && !route?.params) {
        setHideForm(true);
      }
      if (isFocused) {
        setInitialValues();
      }
    }
  }, [isFocused]);
  console.log("values", instructorInfo);

  useEffect(() => {
    if (isFocused && route?.params && !route?.params?.groupId) {
      getActivityOptInDetail();
      getActivityDetail();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      console.log("instructor", infomation);
      setInitialValues({
        orgId: instructorInfo?.orgId,
        schoolId: instructorInfo?.schoolId,
        name: activity?.activityName || "",
        activityType: activity?.activityType || "",
        from: infomation?.scheduler
          ? new Date(infomation?.scheduler?.fromDate?.split("T")[0])
          : new Date(),
        // activity ? new Date(activity?.date?.split(" ")[0]) : new Date(),
        fromTime: infomation?.scheduler
          ? moment(infomation?.scheduler?.fromDate)
              .subtract("hours", 5)
              .format("hh:mm a")
          : //  moment(activity.date).subtract("hours", 5).format("hh:mm a")
            timeStamp[0],
        // activity
        //   ? activity?.date?.split(" ")[2]
        //   : //  moment(activity.date).subtract("hours", 5).format("hh:mm a")
        //     timeStamp[0],
        to: infomation?.scheduler
          ? new Date(infomation?.scheduler?.toDate?.split("T")[0])
          : new Date(),
        toTime: infomation?.scheduler
          ? moment(infomation?.scheduler?.toDate)
              .subtract("hours", 5)
              .format("hh:mm a")
          : timeStamp[3],
        // activity && activity?.date.split(" ")[2],

        fromVenueName: activity?.venueFromName || "",
        fromAddress: activity?.venueFromAddress || "",
        fromCity: activity?.venueFromCity || currentUser?.city || "",
        fromSelectedCity: activity?.venueFromCity || "",
        fromState: activity?.venueFromState || currentUser?.state || "",
        fromSelectedState: activity?.venueFromState || "",
        fromZipCode: activity?.venueFromZip || "",
        venueName: activity?.venueToName || "",
        address: activity?.venueToAddress || "",
        city: infomation?.venueToCity || "",
        selectedCity: infomation?.venueToCity || "",
        state: infomation?.venueToState
          ? infomation?.venueToState
          : currentUser?.state
          ? currentUser?.state
          : "",
        selectedState: infomation?.venueToState
          ? infomation?.venueToState
          : currentUser?.state
          ? currentUser?.state
          : "",
        zipCode: activity?.venueToZip || "",
        instructions: optIn?.instructions || "",
        disclaimer: optIn?.disclaimer || "",
        agreement: optIn?.agreement || "",
        starting: new Date(),
        startingFrom: "",
        startingTo: "",
        selectedCountry: "",
        country: currentUser?.country || "",
        onBehalfOf: onBehalf,
      });
    }
  }, [isFocused, activity, infomation, user, optIn]);
  console.log("orgId9009909090909090909090", instructors);
  // console.log("format date0000000000000000000000", activity);
  return (
    <>
      <GroupSelectionModal
        getGroupDetail={(id: any) => {
          getGroupDetail(id);
          dispatch(
            ChangeModalState.action({ groupSelectionModalVisibility: false })
          );
        }}
        individuals={groups}
        setIndividuals={setGroups}
      />
      <AddIndividialMembersModal
        individuals={students}
        // individual={(item)=>{
        //   setStudents([...students, item]);
        // }}
        setIndividuals={(item) => {
          console.log("item---", item);
          setStudents([...item]);
        }}
      />
      <AppHeader
        title="Create Activity"
        hideCalendar={true}
        hideApproval={true}
      />
      <ScrollView style={styles.layout}>
        {/* <Text
          textBreakStrategy={"highQuality"}
          style={{
            textAlign: "center",
            color: "#606060",
            fontSize: 18,
          }}
        >
          Create a name for your Activity / Trip
        </Text> */}

        {true && (
          <Formik
            // validateOnMount={true}
            enableReinitialize
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={async (values, { resetForm }) => {
              dispatch(ChangeModalState.action({ loading: true }));
              const _instructor =
                (instructors &&
                  instructors?.result?.length > 0 &&
                  instructors?.result.find(
                    (i) =>
                      i?.firstname + " " + i?.lastname === values.onBehalfOf
                  ) &&
                  instructors?.result.find(
                    (i) =>
                      i?.firstname + " " + i?.lastname === values.onBehalfOf
                  ).instructorId) ||
                0;
              // console.log("onBhelf", _instructor);
              let totime = moment(values.toTime, ["h:mm A"]).format("HH:mm");
              let todate = moment(values.to).format("YYYY-MM-DD");
              let fromtime = moment(values.fromTime, ["h:mm A"]).format(
                "HH:mm"
              );
              let fromdate = moment(values.from).format("YYYY-MM-DD");
              // console.log("date", values.from + "----", +values.fromTime);
              // console.log("fafaffafafafafa", date + "T" + time + ":00.000Z");
              const data = {
                id: isEdit ? activity?.activityId : 0,
                name: values.name,
                requestPermission: true,
                type: selectedIndex === 2 ? "trip" : "activity",
                where: values.venueName,
                address: values.address,
                venueToName: values.venueName,
                venueToAddress: values.address,
                venueToCity: values.city,
                venueToState: values.state,
                venueToZip: values.zipCode,
                venueFromName: values.fromVenueName,
                venueFromAddress: values.fromAddress,
                venueFromCity: values.fromCity,
                venueFromState: values.fromState,
                venueFromZip: values.fromZipCode,
                schoolId: currentUser?.schoolId || null,
                venueToCountry: selectedIndex == 0 ? values.country : "",
                venueFromCountry: selectedIndex != 0 ? values.country : "",
                orgId: currentUser?.orgId || null,
                onBehalfOf: values.onBehalfOf ? _instructor : 0,
                students: [],
                instructors: [],
                status: "approved",
                completionStatus: "active",
                groups: [0],
                schedule: {
                  id: 0,
                  recurrence: timeSelectedIndex === 2 ? 1 : 0,
                  fromDate: fromdate + "T" + fromtime + ":00.000Z",
                  // `${moment(values.from).format(
                  //   "YYYY-MM-DD hh:mm:ss"
                  // )} ${values.fromTime}`,
                  toDate: todate + "T" + totime + ":00.000Z",
                  //  `${moment(values.to).format("YYYY-MM-DD hh:mm:ss")} ${
                  //   values.toTime
                  // }`,,
                  days:
                    timeSelectedIndex === 2
                      ? days.map((d) => (d.selected ? 1 : 0)).join("")
                      : 0,
                  status: "enabled",
                },

                journey: {
                  journeyStartToDestination: "",
                  journeyStartToOrgin: "",
                  eta: 0,
                  id: 0,
                },
                optin: {
                  instructions: values.instructions || "",
                  disclaimer: values.disclaimer || "",
                  agreement: values.agreement || "",
                  status: true,
                },
              };
              // console.log("data", data);
              const _students = [];
              students.map((item) => {
                if (!item?.isEdit) {
                  _students.push({
                    firstName: item?.name?.split(" ")[0],

                    parentEmail1: item.parent1_email,
                    parentEmail12: item.parent2_email,
                    lastName: item?.name?.split(" ")[1] || "",
                  });
                }
              });
              // const _individuals = students.map((student) => ({
              //   email: student?.email,
              //   grades: [
              //     {
              //       id: 0,
              //       name: "string",
              //       subject: [
              //         {
              //           id: 0,
              //           name: "string",
              //         },
              //       ],
              //     },
              //   ],
              //   firstname: student?.firstName,
              //   lastname: student?.lastName,
              //   address: "",
              //   state: "",
              //   city: "",
              //   country: "",
              //   zipcode: "",
              //   phone: "",
              //   term: true,
              //   isAdmin: true,
              //   schoolId: user?.schoolId,
              //   orgId: user?.orgId,
              // }));
              // console.log("data-------------------------", data);
              if (!isEdit) {
                console.log("data", data);
                CreateActivity(data)
                  .then(async (res) => {
                    let notifyToParents = true;
                    if (_students && _students?.length > 0) {
                      notifyToParents = false;
                      notifyToParents = await NotifyToParent(
                        res?.activityId,
                        _students
                      );
                      notifyToParents = true;
                    }
                    // NotifyToParent(res?.activityId, _students)
                    //   .then((res) => {})
                    //   .catch((err) => console.log("NotifyToParent", err));
                    const _instructors = instructorsList?.map((item) => ({
                      firstName: item?.firstname,
                      lastName: item?.lastname,
                      email: item?.email,
                    }));

                    let notifyToInstructor = true;
                    if (_instructors?.length > 0) {
                      notifyToInstructor = false;
                      await NotifyToInstructors(res?.activityId, _instructors);
                      notifyToInstructor = true;
                    }

                    // NotifyToInstructors(res?.activityId, _instructors)
                    //   .then((res) => {
                    //     console.log(res);
                    //   })
                    //   .catch((err) => console.log("NotifyToInstructors", err));
                    if (notifyToInstructor && notifyToParents) {
                      Toast.show({
                        type: "success",
                        text2: "Activity has been successfully created",
                      });
                      dispatch(ChangeModalState.action({ loading: false }));
                      resetForm();
                      setStudents([]);
                      setDeletedStudents([]);
                      setDeletedInstructors([]);
                      setInstructorList([]);
                      setInformation({});
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: "InstructorActivity",
                          },
                        ],
                      });
                      // CreateMultipleInstructor(_individuals).then(res => {
                      //   console.log(res)
                      // }).catch(err => console.log('CreateMultipleInstructor', err))
                      setGroups([]);
                      // setStudents([])
                      setAskPermission(false);
                    }
                    // resetForm();
                  })
                  .catch((err) => {
                    console.log("err", err);
                    Toast.show({
                      type: "info",
                      text2: "Something went wrong",
                    });
                    // dispatch(ChangeModalState.action({ loading: false }));
                  });
              } else {
                UpdateActivity(data)
                  .then(async (res) => {
                    Toast.show({
                      type: "success",
                      text2: "Activity has been updated successfully",
                    });
                    dispatch(ChangeModalState.action({ loading: false }));
                    // navigation.navigate("InstructorActivity");
                    // CreateMultipleInstructor(_individuals).then(res => {
                    //   console.log(res)
                    // }).catch(err => console.log('CreateMultipleInstructor', err))

                    let deletedInstructor = [];
                    let deletedStudent = [];
                    deletedInstructors.map((item) => {
                      deletedInstructor.push(item?.instructorId);
                    });

                    deletedStudents.map((item) => {
                      deletedStudent.push(item?.id);
                    });
                    if (
                      deletedInstructor.length > 0 ||
                      deletedStudent.length > 0
                    ) {
                      await DeleteActivityParticipants({
                        studentId:
                          deletedStudent.length == 0 ? [] : deletedStudent,
                        instructorId:
                          deletedInstructor.length == 0
                            ? []
                            : deletedInstructor,
                        activityId: activity?.activityId,
                      });
                    }

                    let notifyToParents = true;
                    if (_students && _students?.length > 0) {
                      notifyToParents = false;
                      notifyToParents = await NotifyToParent(
                        activity?.activityId,
                        _students
                      );
                      notifyToParents = true;
                    }
                    // NotifyToParent(activity?.activityId, _students)
                    //   .then((res) => {})
                    //   .catch((err) => console.log("NotifyToParent", err));
                    let instructors = [];
                    instructorsList?.map((item) => {
                      if (!item?.isEdit) {
                        instructors.push({
                          firstName: item?.firstname,
                          lastName: item?.lastname,
                          email: item?.email,
                        });
                      }
                    });

                    // NotifyToInstructors(activity?.activityId, instructors)
                    //   .then((res) => {
                    //     console.log(res);
                    //   })
                    //   .catch((err) => console.log("NotifyToInstructors", err));

                    let notifyToInstructor = true;
                    if (instructors?.length > 0) {
                      notifyToInstructor = false;
                      await NotifyToInstructors(
                        activity?.activityId,
                        instructors
                      );
                      notifyToInstructor = true;
                    }

                    if (notifyToInstructor && notifyToParents) {
                      dispatch(ChangeModalState.action({ loading: false }));
                      resetForm();
                      setStudents([]);
                      setDeletedStudents([]);
                      setDeletedInstructors([]);
                      setInstructorList([]);
                      setDeletedStudents([]);
                      setDeletedInstructors([]);
                      setInformation({});
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: "InstructorActivity",
                          },
                        ],
                      });

                      setGroups([]);
                      setInformation({});
                      // setStudents([])
                      setAskPermission(false);
                    }
                    // resetForm();
                  })
                  .catch((err) => {
                    console.log("err", err);
                    Toast.show({
                      type: "info",
                      text2: "Something went wrong",
                    });
                    // dispatch(ChangeModalState.action({ loading: false }));
                  });
              }
            }}
          >
            {({
              handleChange,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              isValid,
              resetForm,
              touched,
            }) => (
              <>
                {console.log("err", errors)}
                <View style={styles.formContainer}>
                  {/* {console.log("values", values)} */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 5,
                      alignSelf: "center",
                      width: "100%",
                      marginLeft: "5%",
                    }}
                  >
                    <Text style={{ marginTop: 18 }}>On behalf of</Text>
                    <Select
                      style={{ width: "50%", marginTop: -10 }}
                      value={values.onBehalfOf}
                      placeholder="Select Name"
                      onSelect={(index: any) => {
                        setFieldValue(
                          "onBehalfOf",
                          instructors?.result[index.row]?.firstname +
                            " " +
                            instructors?.result[index.row]?.lastname
                        );
                      }}
                      label={(evaProps: any) => <Text {...evaProps}></Text>}
                    >
                      {instructors &&
                        instructors?.result &&
                        instructors?.result?.map((item) => (
                          <SelectItem
                            key={item?.instructorId}
                            title={item?.firstname + " " + item?.lastname}
                          />
                        ))}
                    </Select>
                  </View>
                  <Input
                    style={{
                      marginTop: 10,
                      alignSelf: "center",
                      width: "100%",
                      marginLeft: "5%",
                    }}
                    placeholder="Name your Activity/Trip*"
                    onChangeText={handleChange("name")}
                    value={values.name}
                  />
                  {errors.name ? (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  ) : null}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginLeft: "5%",
                      width: "100%",
                    }}
                  >
                    <RadioGroup
                      selectedIndex={selectedIndex}
                      style={{
                        flexDirection: "column",
                        alignItems: "center",
                        width: "50%",
                      }}
                      onChange={(index) => setSelectedIndex(index)}
                    >
                      <Radio style={{ flexDirection: "row", width: "50%" }}>
                        {(evaProps) => (
                          <Text
                            {...evaProps}
                            style={{ fontSize: 14, marginLeft: 10 }}
                          >
                            {" "}
                            Activity
                          </Text>
                        )}
                      </Radio>
                      <Divider />
                      <Radio style={{ flexDirection: "row", width: "50%" }}>
                        {(evaProps) => (
                          <Text
                            {...evaProps}
                            style={{ fontSize: 14, marginLeft: 10 }}
                          >
                            Trip
                          </Text>
                        )}
                      </Radio>
                      <Divider />
                    </RadioGroup>
                    <RadioGroup
                      selectedIndex={timeSelectedIndex}
                      style={{
                        flexDirection: "column",
                        alignItems: "center",
                        width: "50%",
                      }}
                      onChange={(index) => setTimeSelectedIndex(index)}
                    >
                      <Radio style={{ flexDirection: "row", width: "50%" }}>
                        {(evaProps) => (
                          <Text
                            {...evaProps}
                            style={{ fontSize: 14, marginLeft: 10 }}
                          >
                            {" "}
                            One-Time
                          </Text>
                        )}
                      </Radio>
                      <Divider />
                      <Radio style={{ flexDirection: "row", width: "50%" }}>
                        {(evaProps) => (
                          <Text
                            {...evaProps}
                            style={{ fontSize: 14, marginLeft: 10 }}
                          >
                            {" "}
                            Recurring
                          </Text>
                        )}
                      </Radio>

                      <Divider />
                    </RadioGroup>
                  </View>
                  {timeSelectedIndex !== 2 && (
                    <>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "90%",
                        }}
                      >
                        <Datepicker
                          min={new Date(1900, 0, 0)}
                          style={[styles.selectSettings, { width: "60%" }]}
                          label="From*"
                          placeholder="From"
                          date={values.from}
                          onSelect={(date: Date | null) => {
                            setFieldValue("from", date);
                          }}
                        />
                        <Select
                          value={values.fromTime}
                          style={{ marginTop: 5, marginLeft: 5, width: "45%" }}
                          placeholder="From"
                          onSelect={(index: any) => {
                            setFieldValue("fromTime", timeStamp[index.row]);
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          {timeStamp &&
                            timeStamp.length > 0 &&
                            timeStamp.map((_timeStamp, index) => {
                              return (
                                <SelectItem
                                  key={index}
                                  title={_timeStamp || ""}
                                />
                              );
                            })}
                        </Select>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "90%",
                        }}
                      >
                        <Datepicker
                          min={new Date(1900, 0, 0)}
                          style={[styles.selectSettings, { width: "60%" }]}
                          label="To*"
                          placeholder="To"
                          date={values.to}
                          onSelect={(date: Date | null) => {
                            setFieldValue("to", date);
                          }}
                        />
                        {/* {console.log("values", values.toTime)} */}
                        <Select
                          value={values.toTime}
                          style={{ marginTop: 5, marginLeft: 5, width: "45%" }}
                          placeholder="To"
                          onSelect={(index: any) => {
                            setFieldValue("toTime", timeStamp[index.row]);
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          {timeStamp &&
                            timeStamp.length > 0 &&
                            timeStamp.map((_timeStamp, index) => {
                              return (
                                <SelectItem
                                  key={index}
                                  title={_timeStamp || ""}
                                />
                              );
                            })}
                        </Select>
                      </View>
                    </>
                  )}
                  {timeSelectedIndex === 2 && (
                    <>
                      <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: "90%" }]}
                        label="Starting*"
                        placeholder="Starting"
                        date={values.from}
                        onSelect={(date: Date | null) => {
                          setFieldValue("from", date);
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "90%",
                          marginTop: 10,
                        }}
                      >
                        <Text>From</Text>
                        <Input
                          placeholder="00:00 AM"
                          onChangeText={handleChange("toTime")}
                          value={values.startingFrom}
                          style={{ marginLeft: 10 }}
                        />
                        <Text style={{ marginLeft: 10 }}>To</Text>
                        <Input
                          placeholder="00:00 AM"
                          onChangeText={handleChange("startingTo")}
                          value={values.startingTo}
                          style={{ marginLeft: 10 }}
                        />
                      </View>
                      <Text
                        style={{
                          color: "#000",
                          marginTop: 15,
                          marginLeft: 15,
                          alignSelf: "flex-start",
                        }}
                      >
                        Every
                      </Text>
                      <ScrollView
                        style={{ flexDirection: "row" }}
                        contentContainerStyle={{ alignItems: "center" }}
                        horizontal
                      >
                        {days &&
                          days.map((day) => (
                            <TouchableOpacity
                              style={
                                day.selected ? styles.selectedDay : styles.day
                              }
                              onPress={() => {
                                const data = [...days];
                                const index = data.findIndex(
                                  (i) => i.name === day.name
                                );
                                data[index].selected = !day.selected;
                                setDays(data);
                              }}
                            >
                              <Text
                                style={{
                                  color: day.selected ? "#fff" : "#000",
                                }}
                              >
                                {day.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    </>
                  )}
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: 18,
                      fontWeight: "700",
                      marginVertical: 10,
                      alignSelf: "flex-start",
                      marginLeft: "5%",
                    }}
                  >
                    {selectedIndex === 0 ? "At*" : "From*"}
                  </Text>
                  {/* {console.log("errors", errors)} */}
                  <View
                    style={{
                      padding: 15,
                      borderWidth: 1,
                      borderRadius: 20,
                      borderColor: Colors.primary,
                      width: "100%",
                      marginLeft: "5%",
                      marginVertical: 10,
                    }}
                  >
                    <Input
                      style={{ marginRight: 20, width: "100%" }}
                      placeholder="Venue name*"
                      onChangeText={handleChange("fromVenueName")}
                      value={values.fromVenueName}
                    />
                    {errors.venueName && touched.venueName && (
                      <Text style={styles.errorText}>{errors.venueName}</Text>
                    )}
                    <Input
                      style={{ marginRight: 20, marginTop: 10, width: "100%" }}
                      placeholder="Address*"
                      onChangeText={handleChange("fromAddress")}
                      value={values.fromAddress}
                    />
                    {errors.address && touched.address && (
                      <Text style={styles.errorText}>{errors.address}</Text>
                    )}
                    {/* <Select
                    style={[styles.selectSettings, { marginVertical: 5 }]}
                    value={values.fromState}
                    placeholder="State"
                    onSelect={(query) => { }}
                  >
                  </Select>
                  <Input
                    style={{ marginRight: 20, marginTop: 10, width: "100%" }}
                    placeholder="City"
                    onChangeText={handleChange("fromCity")}
                    value={values.fromCity}
                  /> */}
                    <Autocomplete
                      placeholder="Country*"
                      value={values.country}
                      placement="bottom"
                      style={{ marginVertical: 5 }}
                      // label={evaProps => <Text {...evaProps}>Country*</Text>}
                      onChangeText={(query) => {
                        setFieldValue("country", query);
                        setCountriesData(
                          countries.filter((item) =>
                            filterCountries(item, query)
                          )
                        );
                      }}
                      onSelect={(query) => {
                        const selectedCountry = countriesData[query];
                        console.log("000000", selectedCountry.name);
                        setFieldValue("country", selectedCountry.name);
                        setFieldValue("selectedCountry", selectedCountry.name);
                        setFieldValue("fromSelectedState", "");
                        setFieldValue("state", "");
                        setStates([]);
                        GetAllStates(
                          selectedCountry.name.replace(/ /g, "")
                        ).then((res) => {
                          setStates(res.data);
                          setStatesData(states);
                        });
                      }}
                    >
                      {countriesData?.map((item, index) => {
                        return (
                          <AutocompleteItem key={index} title={item.name} />
                        );
                      })}
                    </Autocomplete>
                    <Autocomplete
                      placeholder="State"
                      value={values.fromState}
                      placement="bottom"
                      style={{ marginVertical: 5 }}
                      // label={evaProps => <Text {...evaProps}>State</Text>}
                      onChangeText={(query) => {
                        setFieldValue("fromState", query);
                        setStatesData(
                          states.filter((item) => filterStates(item, query))
                        );
                      }}
                      onSelect={(query) => {
                        const selectedState = statesData[query];
                        setFieldValue("fromState", selectedState);
                        setFieldValue("fromSelectedState", selectedState);
                        setFieldValue("fromSelectedCity", "");
                        setFieldValue("city", "");
                        setCities([]);
                        GetAllCities(
                          values.selectedCountry,
                          selectedState
                        ).then((res) => {
                          setCities(res.data);
                        });
                      }}
                    >
                      {statesData.map((item, index) => {
                        return <AutocompleteItem key={index} title={item} />;
                      })}
                    </Autocomplete>
                    <Autocomplete
                      placeholder="City"
                      value={values.fromCity}
                      placement="bottom"
                      style={{ marginVertical: 5 }}
                      // label={evaProps => <Text {...evaProps}>City</Text>}
                      onChangeText={(query) => {
                        setFieldValue("fromCity", query);
                        setCitiesData(
                          cities.filter((item) => filterCities(item, query))
                        );
                      }}
                      onSelect={(query) => {
                        setFieldValue("fromCity", citiesData[query]);
                        setFieldValue("fromSelectedCity", citiesData[query]);
                      }}
                    >
                      {citiesData.map((item, index) => {
                        return <AutocompleteItem key={index} title={item} />;
                      })}
                    </Autocomplete>
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Zip code"
                      onChangeText={handleChange("fromZipCode")}
                      value={values.fromZipCode}
                    />
                  </View>
                  {selectedIndex === 2 && (
                    <>
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginVertical: 10,
                          alignSelf: "flex-start",
                          marginLeft: "5%",
                        }}
                      >
                        To*
                      </Text>
                      <View
                        style={{
                          padding: 15,
                          borderWidth: 1,
                          borderRadius: 20,
                          borderColor: Colors.primary,
                          width: "100%",
                          marginLeft: "5%",
                          marginVertical: 10,
                        }}
                      >
                        <Input
                          style={{ marginRight: 20, width: "100%" }}
                          placeholder="Venue name"
                          onChangeText={handleChange("venueName")}
                          value={values.venueName}
                        />
                        <Input
                          style={{
                            marginRight: 20,
                            marginTop: 10,
                            width: "100%",
                          }}
                          placeholder="Address"
                          onChangeText={handleChange("address")}
                          value={values.address}
                        />
                        <Select
                          style={[styles.selectSettings, { marginVertical: 5 }]}
                          value={values.state}
                          placeholder="State"
                          onSelect={(query) => {}}
                        >
                          {/* {
                                        states?.map((state, index) => {
                                            return <SelectItem key={index} title={state} />
                                        })
                                    } */}
                        </Select>
                        <Input
                          style={{
                            marginRight: 20,
                            marginTop: 10,
                            width: "100%",
                          }}
                          placeholder="City"
                          onChangeText={handleChange("city")}
                          value={values.city}
                        />
                        <Input
                          style={{ width: "100%" }}
                          placeholder="Zip code"
                          onChangeText={handleChange("zipCode")}
                          value={values.zipCode}
                        />
                      </View>
                    </>
                  )}

                  <Input
                    style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                    textStyle={{ minHeight: 120, textAlignVertical: "top" }}
                    placeholder="Instructions"
                    onChangeText={handleChange("instructions")}
                    value={values.instructions}
                    multiline={true}
                    maxLength={500}
                  />
                  <Input
                    style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                    textStyle={{ minHeight: 120, textAlignVertical: "top" }}
                    placeholder="Disclaimer"
                    onChangeText={handleChange("disclaimer")}
                    value={values.disclaimer}
                    multiline={true}
                    maxLength={500}
                  />
                  <Input
                    style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                    textStyle={{ minHeight: 120, textAlignVertical: "top" }}
                    placeholder="Agreement"
                    onChangeText={handleChange("agreement")}
                    value={values.agreement}
                    multiline={true}
                    maxLength={500}
                  />

                  <View
                    style={[
                      styles.background,
                      {
                        backgroundColor: Colors.white,
                        borderWidth: 2,
                        borderColor: Colors.primary,
                        // margin: 0,
                        // padding: 0,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.background,
                        {
                          backgroundColor: Colors.white,
                          // alignItems: "center",
                          // margin: 0,
                          // padding: 0,
                        },
                      ]}
                      disabled={!isValid}
                      onPress={() => {
                        dispatch(
                          ChangeModalState.action({
                            addIndividualMemberModalVisibility: true,
                          })
                        );
                      }}
                    >
                      <Text
                        style={[
                          styles.button,
                          { color: Colors.primary, fontSize: 20 },
                        ]}
                      >
                        Add Students
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {students && students.length > 0 && (
                    <View
                      style={{ width: "100%", marginTop: 15, marginLeft: "5%" }}
                    >
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginBottom: 10,
                        }}
                      >
                        Students*
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: Colors.primary,
                          padding: 5,
                        }}
                      >
                        {students &&
                          students.length > 0 &&
                          students?.map((item) => (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 2.5,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Text>{item?.name}</Text>
                              </View>
                              <AntDesign
                                name="delete"
                                color={Colors.primary}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                                onPress={() => handleRemoveStudent(item)}
                              />
                            </View>
                          ))}
                      </View>
                    </View>
                  )}

                  <Select
                    style={{ width: "90%", marginBottom: 10 }}
                    // value={months[selectedMonth]}
                    placeholder="Add Instructors"
                    onSelect={(index: any) => {
                      // console.log("LOGS000000", instructorsList[index.row]);
                      let findItem = instructorsList.filter(
                        (item) =>
                          item?.instructorId ==
                          instructorsList[index.row]?.instructorId
                      );
                      // console.log("findItem", findItem);
                      if (findItem.length == 0) {
                        setInstructorList([
                          ...instructorsList,
                          instructors?.result[index.row],
                        ]);
                      }
                      // console.log("logs", moment().format("M"));
                      // console.log("index", index.row);
                      // setSelectedMonth(index.row);
                      // setDays(getDays(months[index.row]));
                    }}
                    label={(evaProps: any) => <Text {...evaProps}></Text>}
                  >
                    {instructors?.result?.map((item, index) => {
                      return (
                        <SelectItem
                          key={index}
                          title={item?.firstname + " " + item?.lastname}
                        />
                      );
                    })}
                  </Select>
                  {instructorsList?.length > 0 && (
                    <View
                      style={{ width: "100%", marginTop: 15, marginLeft: "5%" }}
                    >
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginBottom: 10,
                        }}
                      >
                        Instructors*
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: Colors.primary,
                          padding: 5,
                        }}
                      >
                        {instructorsList &&
                          instructorsList.length > 0 &&
                          instructorsList?.map((item) => (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 2.5,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Text>
                                  {item?.firstname + " " + item?.lastname}
                                </Text>
                              </View>
                              <AntDesign
                                name="delete"
                                color={Colors.primary}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                                onPress={() => handleRemoveInstructors(item)}
                              />
                            </View>
                          ))}
                      </View>
                    </View>
                  )}
                  <View
                    style={[
                      styles.background,
                      {
                        backgroundColor: Colors.white,
                        borderWidth: 2,
                        borderColor: Colors.primary,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.background,
                        {
                          backgroundColor: Colors.white,
                        },
                      ]}
                      // disabled={values?.name?.length < 3 || values?.name?.length > 20}
                      onPress={() =>
                        dispatch(
                          ChangeModalState.action({
                            groupSelectionModalVisibility: true,
                          })
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.button,
                          { color: Colors.primary, fontSize: 20 },
                        ]}
                      >
                        Add Existing Group
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {groups && groups.length > 0 && (
                    <View
                      style={{ width: "100%", marginTop: 15, marginLeft: "5%" }}
                    >
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginBottom: 10,
                        }}
                      >
                        Members*
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: Colors.primary,
                          padding: 5,
                        }}
                      >
                        {groups &&
                          groups.length > 0 &&
                          groups?.map((item) => (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 2.5,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Text>{item.groupName}</Text>
                              </View>
                              <AntDesign
                                name="delete"
                                color={Colors.primary}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                                onPress={() => handleRemoveGroup(item)}
                              />
                            </View>
                          ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.buttonSettings}>
                    {/* <View style={{ marginVertical: 20 }}>
                      <CheckBox
                        style={{ marginLeft: 20 }}
                        checked={askPermission}
                        onChange={() => setAskPermission(!askPermission)}
                      >
                        {"Request Permission from Parents/Guardian"}
                      </CheckBox>
                    </View> */}
                    <View
                      style={[
                        styles.background,
                        {
                          backgroundColor:
                            values?.name?.length < 3 ||
                            values?.name?.length > 20
                              ? Colors.lightgray
                              : Colors.primary,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.background,
                          {
                            backgroundColor:
                              values?.name?.length < 3 ||
                              values?.name?.length > 20
                                ? Colors.lightgray
                                : Colors.primary,
                          },
                        ]}
                        // disabled={values?.name?.length < 3 || values?.name?.length > 20}
                        onPress={handleSubmit}
                      >
                        <Text style={styles.button}>
                          {isEdit ? "Update" : `Send invitation`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.background]}>
                      <TouchableOpacity
                        style={[styles.background]}
                        // disabled={!isValid}
                        onPress={() => {
                          resetForm();
                          _dispatch({
                            type: actions.SET_SELECTED_ACTIVITY,
                            payload: [],
                          });
                          setStudents([]);
                          setInstructorList([]);
                          navigation.reset({
                            index: 0,
                            routes: [
                              {
                                name: "InstructorActivity",
                              },
                            ],
                          });
                          // navigation.goBack();
                        }}
                      >
                        <Text style={styles.button}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )}
          </Formik>
        )}
      </ScrollView>
    </>
  );
};

export default CreateActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 20,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
  },
  background: {
    width: "90%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
    width: "95%",
    alignItems: "center",
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  errorText: {
    fontSize: 10,
    color: "red",
    marginLeft: 10,
    marginTop: 10,
  },
  selectSettings: {
    width: "100%",
  },
  day: {
    paddingHorizontal: 5,
    height: 40,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  selectedDay: {
    paddingHorizontal: 5,
    height: 40,
    backgroundColor: Colors.primary,
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    marginLeft: 5,
  },
});
