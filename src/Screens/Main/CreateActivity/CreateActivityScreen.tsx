import { LinearGradientButton } from "@/Components";
import BackgroundLayout from "@/Components/BackgroundLayout";
import { actions } from "@/Context/state/Reducer";
import { useStateValue } from "@/Context/state/State";
import { AddIndividialMembersModal, GroupSelectionModal } from "@/Modals";
import {
  CreateActivity, DeleteActivityParticipants, GetActivity,
  GetOptIn, UpdateActivity
} from "@/Services/Activity";
import NotifyToInstructors from "@/Services/Activity/NotifyToInstructors";
import NotifyToParent from "@/Services/Activity/NotifyToParent";
import { GetGroup } from "@/Services/Group";
import {
  FindInstructorBySchoolOrg,
  GetInstructor
} from "@/Services/Instructor";
import { GetOrg } from "@/Services/Org";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { GetSchool } from "@/Services/School";
import FetchOne from "@/Services/User/FetchOne";
import { loadUserId } from "@/Storage/MainAppStorage";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { PlaceState } from "@/Store/Places";
import { UserState } from "@/Store/User";
import ChangeUserState from "@/Store/User/FetchOne";
import Colors from "@/Theme/Colors";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  Autocomplete,
  AutocompleteItem, CheckBox, Datepicker, Divider,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem, Text
} from "@ui-kitten/components";
import { Formik } from "formik";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Image, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { Toast } from "react-native-toast-message/lib/src/Toast";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
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
  console.log("currentUser", currentUser.isAdmin);
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
  const [fromCheckBox, setFromCheckBox] = useState(false);
  const [toCheckBox, setToCheckBox] = useState(false);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [orgSchoolInfo, setOrgSchoolInfo] = useState();
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
  const getSchoolInfo = async (id: any) => {
    try {
      let res = await GetSchool(id);
      setOrgSchoolInfo(res);
    } catch (err) {
      console.log("err school", err);
    }
  };
  const getOrgInfo = async (id: any) => {
    try {
      let res = await GetOrg(id);
      setOrgSchoolInfo(res);
    } catch (err) {
      console.log("err org", err);
    }
  };

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
      // if (activity) {
      let _ins = instructors?.find((i) => i?.email == currentUser.email);
      // console.log("_ins====================", _ins);
      setOnBehalf(_ins ? _ins?.firstname + " " + _ins?.lastname : "");
      // }

      setInstructors({ result: instructors });

      // setOrgInfo(org);
      //   })
    } catch (err) {
      console.log("err", err);
    }
  };

  const getInstructors = async () => {
    const userId = await loadUserId();

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
        res?.orgId ? getOrgInfo(res?.orgId) : getSchoolInfo(res?.schoolId);
      } else {
        setInstructorInfo(currentUser);
        findInstructorBySchoolId(currentUser);
        currentUser?.orgId
          ? getOrgInfo(currentUser?.orgId)
          : getSchoolInfo(currentUser?.schoolId);

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

        let students = res?.studentsGroupList?.map((item) => ({
          name: item?.firstName + " " + item.lastName,

          parent1_email: item.parentEmail1,
          parent2_email: item.parentEmail2,
        }));
        let instructors = res?.instructorsGroupList?.map((item, index) => ({
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
      setFromCheckBox(false);
      setToCheckBox(false);
      setSelectedIndex(0);
      setSelectedDay("");
      setInitialValues({});
    } else {
      if (isFocused && !route?.params) {
        setHideForm(true);
      }
      if (isFocused) {
        setInitialValues();
      }
    }
    return () => {
      setFromCheckBox(false);
      setToCheckBox(false);
      setSelectedIndex(0);
      setSelectedDay("");
    };
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
        fromCountry: activity?.venueFromCountry || "",
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
        noEnd: false,
      });
    }
  }, [isFocused, activity, infomation, user, optIn, groupInfo, onBehalf]);

  // console.log("format date0000000000000000000000", activity);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <BackgroundLayout title="Create Event">
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
            setStudents([...item]);
          }}
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

          {isFocused && (
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
                let todate = moment(values.to).format('MMM DD, YYYY');
                let fromtime = moment(values.fromTime, ["h:mm A"]).format(
                  "HH:mm"
                );
                let fromdate = moment(new Date(values.from)).format('MMM DD, YYYY');
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
                  venueFromCountry:
                    selectedIndex != 0 ? values.fromCountry : "",
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
                    toDate: values.noEnd
                      ? "9999-12-31T12:00.000Z"
                      : todate + "T" + totime + ":00.000Z",
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
                        await NotifyToInstructors(
                          res?.activityId,
                          _instructors
                        );
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
                  <View style={styles.formContainer}>
                    {console.log("values", values)}
                    {currentUser.isAdmin&&(<View
                      style={{
                        marginTop: 5,

                        width: "95%",
                        marginLeft: "5%",
                      }}
                    >
                      <Select
                        style={{
                          width: "100%",
                          marginTop: -10,
                          borderRadius: 20,
                        }}
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
                        label={(evaProps: any) => (
                          <Text style={styles.inputLabels}>On behalf of</Text>
                        )}
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
                    </View>)}

                    <Input
                      style={styles.textInput}
                      placeholder="Name your Activity/Trip*"
                      onChangeText={handleChange("name")}
                      value={values.name}
                      label={(evaProps: any) => (
                        <Text style={styles.inputLabels}>Event name</Text>
                      )}
                    />
                    {errors.name ? (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    ) : null}
                    <View
                      style={{
                        flexDirection: "column",

                        // justifyContent: "space-between",
                        marginLeft: "5%",
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}
                      >
                        {" "}
                        Event Type*
                      </Text>
                      <RadioGroup
                        selectedIndex={selectedIndex}
                        style={{
                          flexDirection: "row",
                          alignItems: "space-between",
                          width: "60%",
                          icon: () => null,
                        }}
                        onChange={(index) => {
                          setSelectedIndex(index);
                          setToCheckBox(false);
                          setFromCheckBox(false);
                        }}
                      >
                        <Radio
                          appearance="default"
                          status="primary"
                          style={[
                            styles.radioButton,
                            {
                              borderColor:
                                selectedIndex == 0
                                  ? Colors.primary
                                  : "transparent",
                            },
                          ]}
                        >
                          {(evaProps) => (
                            <Text style={{ fontSize: 14, marginLeft: 10 }}>
                              {" "}
                              Activity
                            </Text>
                          )}
                        </Radio>
                        <Divider />

                        <Radio
                          style={[
                            styles.radioButton,
                            {
                              borderColor:
                                selectedIndex == 2
                                  ? Colors.primary
                                  : "transparent",
                            },
                          ]}
                        >
                          {(evaProps) => (
                            <Text style={{ fontSize: 14, marginLeft: 10 }}>
                              Trip
                            </Text>
                          )}
                        </Radio>
                        <Divider />
                      </RadioGroup>
                      <Text
                        style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}
                      >
                        {" "}
                        Event Duration*
                      </Text>
                      <RadioGroup
                        selectedIndex={timeSelectedIndex}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "60%",
                        }}
                        onChange={(index) => setTimeSelectedIndex(index)}
                      >
                        <Radio
                          style={[
                            styles.radioButton,
                            {
                              borderColor:
                                timeSelectedIndex == 0
                                  ? Colors.primary
                                  : "transparent",
                            },
                          ]}
                        >
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
                        <Radio
                          style={[
                            styles.radioButton,
                            {
                              borderColor:
                                timeSelectedIndex == 2
                                  ? Colors.primary
                                  : "transparent",
                            },
                          ]}
                        >
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
                              setFieldValue("to", date);
                            }}
                          >
                            {({ date, onFocus, onBlur }) => (
                              <TextInput
                                value={date ? date.toLocaleDateString() : ""}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                onChangeText={() => {}}
                                placeholder="Select date"
                                style={{
                                  color: "red",
                                  backgroundColor: "red",
                                  width: 2,
                                }} // set the color of the text input
                              />
                            )}
                          </Datepicker>
                          <Select
                            value={values.fromTime}
                            style={{
                              marginTop: 5,
                              marginLeft: 5,
                              width: "45%",
                            }}
                            placeholder="From"
                            onSelect={(index: any) => {
                              setFieldValue("fromTime", timeStamp[index.row]);
                            }}
                            label={(evaProps: any) => (
                              <Text {...evaProps}></Text>
                            )}
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
                            style={{
                              marginTop: 5,
                              marginLeft: 5,
                              width: "45%",
                            }}
                            placeholder="To"
                            onSelect={(index: any) => {
                              setFieldValue("toTime", timeStamp[index.row]);
                            }}
                            label={(evaProps: any) => (
                              <Text {...evaProps}></Text>
                            )}
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
                        {/* <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: "90%" }]}
                        label="Starting*"
                        placeholder="Starting"
                        date={values.from}
                        onSelect={(date: Date | null) => {
                          setFieldValue("from", date);
                        }}
                      /> */}
                        {/* <View
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
                          disabled={values?.noEnd}
                          placeholder="00:00 AM"
                          onChangeText={handleChange("startingTo")}
                          value={values.startingTo}
                          style={{ marginLeft: 10 }}
                        />
                      </View> */}
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
                              style={[
                                styles.selectSettings,
                                { width: "60%", borderRadius: 20 },
                              ]}
                              label={() => (
                                <Text style={styles.inputLabels}>From*</Text>
                              )}
                              placeholder="From"
                              date={values.from}
                              onSelect={(date: Date | null) => {
                                setFieldValue("from", date);
                                setFieldValue("to", date);
                              }}
                            >
                              {({ date, onFocus, onBlur }) => (
                                <TextInput
                                  value={date ? date.toLocaleDateString() : ""}
                                  onFocus={onFocus}
                                  onBlur={onBlur}
                                  onChangeText={() => {}}
                                  placeholder="Select date"
                                  style={{
                                    color: "red",
                                    backgroundColor: "red",
                                    width: 2,
                                  }} // set the color of the text input
                                />
                              )}
                            </Datepicker>
                            <Select
                              value={values.fromTime}
                              style={{
                                marginTop: 5,
                                marginLeft: 5,
                                width: "45%",
                              }}
                              placeholder="From"
                              onSelect={(index: any) => {
                                setFieldValue("fromTime", timeStamp[index.row]);
                              }}
                              label={(evaProps: any) => (
                                <Text {...evaProps}></Text>
                              )}
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
                              disabled={values?.noEnd}
                              min={new Date(1900, 0, 0)}
                              style={[styles.selectSettings, { width: "60%" }]}
                              label={() => (
                                <Text style={styles.inputLabels}>To*</Text>
                              )}
                              placeholder="To"
                              date={values.to}
                              onSelect={(date: Date | null) => {
                                setFieldValue("to", date);
                              }}
                            />
                            {/* {console.log("values", values.toTime)} */}
                            <Select
                              disabled={values?.noEnd}
                              value={values.toTime}
                              style={{
                                marginTop: 5,
                                marginLeft: 5,
                                width: "45%",
                              }}
                              placeholder="To"
                              onSelect={(index: any) => {
                                setFieldValue("toTime", timeStamp[index.row]);
                              }}
                              label={(evaProps: any) => (
                                <Text {...evaProps}></Text>
                              )}
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

                        <View
                          style={{
                            flexDirection: "row",

                            alignItems: "center",
                          }}
                        >
                          <Text style={{ marginHorizontal: 15, marginTop: 10 }}>
                            No end
                          </Text>
                          <CheckBox
                            style={[{ flex: 1, marginTop: 15 }]}
                            checked={values?.noEnd}
                            onChange={(checked) => {
                              setFieldValue("noEnd", checked);

                              console.log("checked", checked);
                              // if (checked) {
                              //   Alert.alert(checked);
                              // } else {
                              //   Alert.alert(checked);
                              // }
                            }}
                          >
                            {""}
                          </CheckBox>
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
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "94%",
                      }}
                    >
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
                      <View
                        style={{
                          flexDirection: "row",

                          alignItems: "center",
                        }}
                      >
                        <Text style={{ marginRight: 20, marginTop: 10 }}>
                          Use school/org
                        </Text>
                        <CheckBox
                          disabled={toCheckBox}
                          style={[{ flex: 1, marginTop: 15 }]}
                          checked={fromCheckBox}
                          onChange={(checked) => {
                            setFromCheckBox(checked);
                            if (!fromCheckBox) {
                              setFieldValue(
                                "fromVenueName",
                                orgSchoolInfo?.name
                              );
                              setFieldValue(
                                "fromAddress",
                                orgSchoolInfo?.address
                              );

                              setFieldValue("fromState", orgSchoolInfo?.state);

                              setFieldValue(
                                "fromCountry",
                                orgSchoolInfo?.country
                              );
                              setFieldValue("fromCity", orgSchoolInfo?.city);
                              setFieldValue(
                                "fromZipCode",
                                orgSchoolInfo?.zipcode
                              );
                            } else {
                              setFieldValue("fromVenueName", "");
                              setFieldValue("fromAddress", "");

                              setFieldValue("fromState", "");

                              setFieldValue("fromCountry", "");
                              setFieldValue("fromCity", "");
                              setFieldValue("fromZipCode", "");
                            }
                            console.log("checked", checked);
                            // if (checked) {
                            //   Alert.alert(checked);
                            // } else {
                            //   Alert.alert(checked);
                            // }
                          }}
                        >
                          {""}
                        </CheckBox>
                      </View>
                    </View>

                    <View
                      style={{
                        padding: 15,
                        paddingHorizontal: 2,
                        // borderWidth: 1,
                        borderRadius: 20,
                        borderColor: Colors.primary,
                        width: "100%",
                        // marginLeft: "%",
                        marginVertical: 10,
                      }}
                    >
                      <Input
                        style={styles.textInput}
                        placeholder="Venue name*"
                        onChangeText={handleChange("fromVenueName")}
                        value={values.fromVenueName}
                      />
                      {errors.venueName && touched.venueName && (
                        <Text style={styles.errorText}>{errors.venueName}</Text>
                      )}
                      <Input
                        style={styles.textInput}
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
                        value={values?.fromCountry}
                        placement="bottom"
                        style={styles.textInput}
                        // label={evaProps => <Text {...evaProps}>Country*</Text>}
                        onChangeText={(query) => {
                          setFieldValue("fromCountry", query);
                          setCountriesData(
                            countries.filter((item) =>
                              filterCountries(item, query)
                            )
                          );
                        }}
                        onSelect={(query) => {
                          const selectedCountry = countriesData[query];
                          console.log("000000", selectedCountry.name);
                          setFieldValue("fromCountry", selectedCountry.name);
                          setFieldValue(
                            "selectedCountry",
                            selectedCountry.name
                          );
                          setFieldValue("fromSelectedState", "");
                          setFieldValue("fromState", "");
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
                            <AutocompleteItem
                              style={styles.autoCompleteItem}
                              key={index}
                              title={item.name}
                            />
                          );
                        })}
                      </Autocomplete>
                      <Autocomplete
                        placeholder="State"
                        value={values.fromState}
                        placement="bottom"
                        style={styles.textInput}
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
                          setFieldValue("fromCity", "");
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
                          return (
                            <AutocompleteItem
                              style={styles.autoCompleteItem}
                              key={index}
                              title={item}
                            />
                          );
                        })}
                      </Autocomplete>
                      <Autocomplete
                        placeholder="City"
                        value={values.fromCity}
                        placement="bottom"
                        style={styles.textInput}
                        // label={evaProps => <Text {...evaProps}>City</Text>}
                        onChangeText={(query) => {
                          setFieldValue("fromCity", query);
                          setCitiesData(
                            cities?.filter((item) => filterCities(item, query))
                          );
                        }}
                        onSelect={(query) => {
                          setFieldValue("fromCity", citiesData[query]);
                          setFieldValue("fromSelectedCity", citiesData[query]);
                        }}
                      >
                        {citiesData.map((item, index) => {
                          return (
                            <AutocompleteItem
                              style={styles.autoCompleteItem}
                              key={index}
                              title={item}
                            />
                          );
                        })}
                      </Autocomplete>
                      <Input
                        style={styles.textInput}
                        placeholder="Zip/Post Code"
                        onChangeText={handleChange("fromZipCode")}
                        value={values.fromZipCode}
                      />
                    </View>
                    {selectedIndex === 2 && (
                      <>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
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
                              flexDirection: "row",

                              alignItems: "center",
                            }}
                          >
                            <Text style={{ marginRight: 20, marginTop: 10 }}>
                              Use school/org
                            </Text>
                            <CheckBox
                              disabled={fromCheckBox}
                              style={[{ flex: 1, marginTop: 15 }]}
                              checked={toCheckBox}
                              onChange={(checked) => {
                                setToCheckBox(checked);
                                if (!toCheckBox) {
                                  setFieldValue(
                                    "venueName",
                                    orgSchoolInfo?.name
                                  );
                                  setFieldValue(
                                    "address",
                                    orgSchoolInfo?.address
                                  );

                                  setFieldValue("state", orgSchoolInfo?.state);

                                  setFieldValue(
                                    "country",
                                    orgSchoolInfo?.country
                                  );
                                  setFieldValue("city", orgSchoolInfo?.city);
                                  setFieldValue(
                                    "zipCode",
                                    orgSchoolInfo?.zipcode
                                  );
                                } else {
                                  setFieldValue("venueName", "");
                                  setFieldValue("address", "");

                                  setFieldValue("state", "");

                                  setFieldValue("country", "");
                                  setFieldValue("city", "");
                                  setFieldValue("zipCode", "");
                                }
                                console.log("checked", checked);
                                // if (checked) {
                                //   Alert.alert(checked);
                                // } else {
                                //   Alert.alert(checked);
                                // }
                              }}
                            >
                              {""}
                            </CheckBox>
                          </View>
                        </View>
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
                            style={styles.textInput}
                            placeholder="Venue name"
                            onChangeText={handleChange("venueName")}
                            value={values.venueName}
                          />
                          <Input
                            style={styles.textInput}
                            placeholder="Address"
                            onChangeText={handleChange("address")}
                            value={values.address}
                          />

                          <Autocomplete
                            placeholder="Country*"
                            value={values.country}
                            placement="bottom"
                            style={styles.textInput}
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
                              setFieldValue(
                                "selectedCountry",
                                selectedCountry.name
                              );
                              setFieldValue("toSelectedState", "");
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
                                <AutocompleteItem
                                  key={index}
                                  title={item.name}
                                />
                              );
                            })}
                          </Autocomplete>
                          <Autocomplete
                            placeholder="State"
                            value={values.state}
                            placement="bottom"
                            style={styles.textInput}
                            // label={evaProps => <Text {...evaProps}>State</Text>}
                            onChangeText={(query) => {
                              setFieldValue("state", query);
                              setStatesData(
                                states.filter((item) =>
                                  filterStates(item, query)
                                )
                              );
                            }}
                            onSelect={(query) => {
                              const selectedState = statesData[query];
                              setFieldValue("state", selectedState);
                              setFieldValue("toSelectedState", selectedState);
                              setFieldValue("toSelectedCity", "");
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
                              return (
                                <AutocompleteItem key={index} title={item} />
                              );
                            })}
                          </Autocomplete>
                          <Autocomplete
                            placeholder="City"
                            value={values.city}
                            placement="bottom"
                            style={{ marginVertical: 5 }}
                            // label={evaProps => <Text {...evaProps}>City</Text>}
                            onChangeText={(query) => {
                              setFieldValue("city", query);
                              setCitiesData(
                                cities.filter((item) =>
                                  filterCities(item, query)
                                )
                              );
                            }}
                            onSelect={(query) => {
                              setFieldValue("city", citiesData[query]);
                              setFieldValue(
                                "toSelectedCity",
                                citiesData[query]
                              );
                            }}
                          >
                            {citiesData.map((item, index) => {
                              return (
                                <AutocompleteItem key={index} title={item} />
                              );
                            })}
                          </Autocomplete>

                          <Input
                            style={styles.textInput}
                            placeholder="Zip/Post Code"
                            onChangeText={handleChange("zipCode")}
                            value={values.zipCode}
                          />
                        </View>
                      </>
                    )}

                    <Input
                      style={styles.textArea}
                      textStyle={{ minHeight: 70, textAlignVertical: "top" }}
                      placeholder="Instructions"
                      onChangeText={handleChange("instructions")}
                      value={values.instructions}
                      multiline={true}
                      maxLength={500}
                    />
                    <Input
                      style={styles.textArea}
                      textStyle={{ minHeight: 70, textAlignVertical: "top" }}
                      placeholder="Disclaimer"
                      onChangeText={handleChange("disclaimer")}
                      value={values.disclaimer}
                      multiline={true}
                      maxLength={500}
                    />
                    <Input
                      style={styles.textArea}
                      textStyle={{ minHeight: 70, textAlignVertical: "top" }}
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
                          backgroundColor: "transparent",
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          width: "95%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={[{ color: Colors.primary, fontSize: 15 }]}>
                          Add Students
                        </Text>
                        <TouchableOpacity
                          disabled={!isValid}
                          onPress={() => {
                            dispatch(
                              ChangeModalState.action({
                                addIndividualMemberModalVisibility: true,
                              })
                            );
                          }}
                        >
                          <Image
                            source={require("@/Assets/Images/add.png")}
                            style={{
                              height: 24,
                              width: 24,
                              resizeMode: "contain",
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {students && students.length > 0 && (
                      <View style={styles.participantContainer}>
                        <View style={styles.participantListView}>
                          {students &&
                            students.length > 0 &&
                            students?.map((item, index) => (
                              <View
                                style={[
                                  styles.participantsListCards,
                                  {
                                    borderBottomWidth:
                                      students.length != index + 1 ? 2 : 0,
                                  },
                                ]}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <View>
                                    <Text>{item?.name}</Text>
                                    
                                  </View>
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
                      style={{
                        width: "94%",
                        marginBottom: 10,
                        marginLeft: "3%",
                      }}
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
                      label={(evaProps: any) => (
                        <Text
                          style={[
                            {
                              color: Colors.primary,
                              fontSize: 15,
                              marginBottom: 10,
                            },
                          ]}
                        >
                          Add Instructors
                        </Text>
                      )}
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
                      <View style={styles.participantContainer}>
                        <View style={styles.participantListView}>
                          {instructorsList &&
                            instructorsList.length > 0 &&
                            instructorsList?.map((item, index) => (
                              <View
                                style={[
                                  styles.participantsListCards,
                                  {
                                    borderBottomWidth:
                                      students.length != index + 1 ? 2 : 0,
                                  },
                                ]}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <View>
                                    <Text>
                                      {item?.firstname + " " + item?.lastname}
                                    </Text>
                                  </View>
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
                    <View style={{ height: 42, width: "80%", marginTop: 10 }}>
                      <LinearGradientButton
                        // disabled={values?.name?.length < 3 || values?.name?.length > 20}
                        onPress={() =>
                          dispatch(
                            ChangeModalState.action({
                              groupSelectionModalVisibility: true,
                            })
                          )
                        }
                      >
                        Add Existing Group
                      </LinearGradientButton>
                    </View>

                    {groups && groups.length > 0 && (
                      <View
                        style={{
                          width: "100%",
                          marginTop: 15,
                          marginLeft: "5%",
                        }}
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

                      <TouchableOpacity
                        style={{ width: "100%", alignItems: "center" }}
                        // disabled={values?.name?.length < 3}
                        onPress={handleSubmit}
                      >
                        <LinearGradient
                          colors={[Colors.primary, "#EC5ADD"]}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.linearGradient}
                        >
                          <Text style={styles.button}>
                            {isEdit ? "Update" : `Send invitation`}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </Formik>
          )}
        </ScrollView>
      </BackgroundLayout>
    </View>
  );
};

export default CreateActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 20,
    backgroundColor: Colors.newBackgroundColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    width: "98%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
    marginLeft: "5%",
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
    width: "90%",
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
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 10,
  },
  radioButton: {
    width: "60%",
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingLeft: 10,
    marginLeft: "10%",
  },
  participantContainer: {
    width: "95%",
    marginVertical: 5,
    marginLeft: "2%",
  },
  participantListView: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    padding: 5,
    elevation: 2,
  },
  participantsListCards: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2.5,
    borderColor: Colors.newBackgroundColor,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },

  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 20,
    width: "80%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textArea: {
    marginRight: 20,
    marginTop: 10,
    marginLeft: "8%",
    borderRadius: 10,
    elevation: 2,
    width: "95%",
  },
  textInput: {
    marginTop: 10,
    alignSelf: "center",
    width: "95%",
    marginLeft: "5%",
    borderRadius: 8,
    elevation: 2,
  },
  autoCompleteItem: {
    // elevation: 2,
    backgroundColor: "transparent",
    width: "100%",
    marginLeft: "1%",
  },
});
