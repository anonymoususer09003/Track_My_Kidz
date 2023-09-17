import { InstructionsModal, ShowInstructorsStudentsModal } from "@/Modals";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserTypeState } from "@/Store/UserType";
import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "@ui-kitten/components";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Image, StyleSheet, TouchableOpacity, View
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import { useDispatch, useSelector } from "react-redux";

import BackgroundLayout from "@/Components/BackgroundLayout";
import { actions } from "@/Context/state/Reducer";
import { useStateValue } from "@/Context/state/State";
import { FindAllIstructorActivities } from "@/Services/Activity";
import {
  GetInstructor
} from "@/Services/Instructor";
import { GetSchool } from "@/Services/School";
import { loadUserId } from "@/Storage/MainAppStorage";
import { ModalState } from "@/Store/Modal";
import { UserState } from "@/Store/User";

const instructorImage = require("@/Assets/Images/approval_icon2.png");
const location = require("@/Assets/Images/marker.png");
const clock = require("@/Assets/Images/clock1.png");
const InstructorActivityDetailScreen = ({ route }) => {
  const dispatch = useDispatch();
  const [{ selectedActivity }, _dispatch] = useStateValue();

  const isFocused = useIsFocused();
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType
  );
  const [selectionData, setSelectionData] = useState({
    type: "student",
    status: "pending",
  });
  const [orgInfo, setOrgInfo] = useState(null);
  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] =
    useState(false);
  const data = route?.params?.data;
  const activitiesCount = route?.params?.activitiesCount || {};
  const [insturctorsList,setInstructorsList] = useState([])
  const showInstructorModal = useSelector(
    (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  );
  let temp = [];
  let instructor = data?.instructors?.map((item) => temp.push(item?.firstName));
  const handleGetOrganizationInfo = async () => {
    const userId = await loadUserId();
    let res = await GetInstructor(userId);
    if (res.schoolId || res.orgId) {
      GetSchool(res?.schoolId)
        .then((org) => {
          setOrgInfo(org);
        })
        .catch((err) => console.log('[ERROR]',err));
    }
  };
  useEffect(() => {
    if (isFocused && user_type == "instructor") {
      handleGetOrganizationInfo();
    }
  }, [isFocused]);
  useEffect(()=>{
    setSelectionData({
      status: "approved",
      type: "instructor",
    });
    if(selectionData?.status&&data?.activityId )
    {
    let body = {
      activityId: data?.activityId,
      status: selectionData?.status,
      page: 0,
      page_size: 10,
    };
    FindAllIstructorActivities(body).then((data)=>{
      setInstructorsList(data)
    }).catch((err)=>{console.log('ERRRR', err)});
  }

  },[selectedActivity?.activityId,selectionData?.status])
  return (
    <BackgroundLayout style={{ paddingBottom: 10 }}>
      {showInstructorModal && (
        <InstructionsModal
          selectedInstructions={data?.optin}
          activity={data}
          setSelectedInstructions={() => null}
        />
      )}

      {showStudentsInstructorsModal && (
        <ShowInstructorsStudentsModal
          isVisible={showStudentsInstructorsModal}
          setIsVisible={() => {
            setShowStudentsInstructorsModal(false);
          }}
          status={selectionData?.status}
          type={selectionData?.type}
        />
      )}

      <View
        style={{
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text
          style={{ color: Colors.white, fontSize: 30, textAlign: "center" }}
        >
          {data?.activityName}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 15,
              marginRight: 7,
              marginTop: 5,
              backgroundColor:
                data?.status == "pending" ? Colors.secondary : Colors.green,
            }}
          />
          <Text style={[styles.text, { color: Colors.white }]}>
            {data?.status}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            dispatch(
              ChangeModalState.action({
                instructionsModalVisibility: true,
              })
            );
          }}
          style={{ width: "100%", alignItems: "center" }}
        >
          <Text
            style={[
              styles.text,
              {
                fontSize: 16,
                marginVertical: 15,
                opacity: 0.6,
                color: Colors.white,
              },
            ]}
          >{`Instructions     /    Disclaimer    /    Agreement`}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <View style={styles.countHeader}>
          <View style={{ alignItems: "center" }}>
            <Text
              style={[styles.text, { color: Colors.black }]}
            >{`Approved`}</Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.horizontal}
                onPress={() => {
                  _dispatch({
                    type: actions.SET_SELECTED_ACTIVITY,
                    payload: data,
                  });
                  setSelectionData({
                    status: "approved",
                    type: "student",
                  });
                  setShowStudentsInstructorsModal(true);
                }}
              >
                <Text style={styles.footerText}>{`${
                  activitiesCount[data?.activityId]?.countApprovedStudents ||
                  "0"
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
                    payload: data,
                  });
                  setSelectionData({
                    status: "approved",
                    type: "instructor",
                  });
                  setShowStudentsInstructorsModal(true);
                }}
              >
                <Text style={styles.text}>
                  {activitiesCount[data?.activityId]
                    ?.countApprovedInstructors || "0"}
                </Text>
                <Image
                  source={instructorImage}
                  style={[styles.iconImages, { marginLeft: 3 }]}
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
                    payload: data,
                  });
                  setSelectionData({
                    status: "declined",
                    type: "student",
                  });
                  setShowStudentsInstructorsModal(true);
                }}
              >
                <Text style={styles.text}>{`${
                  activitiesCount[data?.activityId]?.countDeclinedStudents ||
                  "0"
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
                    payload: data,
                  });
                  setSelectionData({
                    status: "declined",
                    type: "instructor",
                  });
                  setShowStudentsInstructorsModal(true);
                }}
              >
                <Text style={styles.text}>
                  {activitiesCount[data?.activityId]
                    ?.countDeclinedInstructors || "0"}
                </Text>
                <Image
                  source={instructorImage}
                  style={[styles.iconImages, { marginLeft: 3 }]}
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
                    payload: data,
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
                    activitiesCount[data?.activityId]?.countPendingStudents ||
                    "0"
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
                    payload: data,
                  });
                  setSelectionData({
                    status: "pending",
                    type: "instructor",
                  });
                  setShowStudentsInstructorsModal(true);
                }}
              >
                <Text style={styles.text}>
                  {activitiesCount[data?.activityId]?.countPendingInstructors ||
                    "0"}
                  {/* {data.countPendingInstructors || `0`} */}
                </Text>
                <Image
                  source={instructorImage}
                  style={[styles.iconImages, { marginLeft: 3 }]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 25 }}>
          <View style={styles.horizontal}>
            <View style={styles.circle}>
              <Image source={clock} style={styles.iconImages} />
            </View>
            <View>
              <Text style={styles.label}>From</Text>
              <Text style={styles.text}>{`${moment.utc(
                data?.fromDate == "string" ? new Date() : data?.fromDate
              ).format("MMM DD, YYYY")} at ${moment.utc(
                data?.fromDate == "string" ? new Date() : data?.fromDate
              )
                .format("hh:mm a")} `}
                </Text>
              {/* <Text style={styles.text}>{`${moment(
              data?.toDate == "string" ? new Date() : data?.toDate
            ).format("YYYY-MM-DD")} at ${moment(
              data?.toDate == "string" ? new Date() : data?.toDate
            )
              .subtract("hours", 5)
              .format("hh:mm a")} `}</Text> */}
            </View>
          </View>

          <View style={styles.horizontal}>
            <View style={styles.circle}>
              <Image source={clock} style={styles.iconImages} />
            </View>
            <View>
              <Text style={styles.label}>To</Text>

              <Text style={styles.text}>{`${moment.utc(
                data?.toDate == "string" ? new Date() : data?.toDate
              ).format("MMM DD, YYYY")} at ${moment.utc(
                data?.toDate == "string" ? new Date() : data?.toDate
              )
                .format("hh:mm a")} `}</Text>
            </View>
          </View>

          <View style={styles.horizontal}>
            <View style={styles.circle}>
              <Image source={location} style={styles.iconImages} />
            </View>
            <View>
              <Text style={styles.label}>Where</Text>

              <Text style={styles.text}>{data?.venueFromName}</Text>
            </View>
          </View>

          <View style={styles.horizontal}>
            <View style={styles.circle}>
              <Image source={location} style={styles.iconImages} />
            </View>
            <View>
              <Text style={styles.label}>Address</Text>
              {orgInfo||data?<Text style={styles.text}>
                {`${data?.venueFromAddress?data?.venueFromAddress:orgInfo?.address}, ${data?.venueFromCity?data?.venueFromCity:orgInfo?.city}, ${data?.venueFromState?data?.venueFromState:orgInfo?.state} ${data?.venueFromZip?data?.venueFromZip:orgInfo?.zipcode}, ${data?.venueFromCountry?data?.venueFromCountry:orgInfo?.country}` || "-"}</Text>:null}
            </View>
          </View>

          <View style={styles.horizontal}>
            <View style={styles.circle}>
              <Image source={instructorImage} style={styles.iconImages} />
            </View>
            <View>
              <Text style={styles.label}>Instructor</Text>

              <Text style={styles.text}>
                {insturctorsList.map((inst)=>{
                  return(
                   <Text>
{  inst?.firstName} {inst.lastName}{insturctorsList.length>1?", ":''}
                   </Text>  
                  )
                })}
                
                {/* {`${temp.toString() || "-"}`} */}
                </Text>
            </View>
          </View>
        </View>
      </View>
    </BackgroundLayout>
  );
};

export default InstructorActivityDetailScreen;

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
    fontSize: 16,

    // marginVertical: 4,
    color: Colors.black,
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
  iconImages: {
    height: 19,
    width: 19,
    resizeMode: "contain",
  },
  footerText: {
    fontSize: 18,
    marginVertical: 2,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  circle: {
    height: 35,
    width: 35,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  main: {
    height: "60%",
    width: "100%",
    borderRadius: 20,
    backgroundColor: Colors.newBackgroundColor,
    overflow: "hidden",
  },
  countHeader: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.white,
    paddingBottom: 10,
  },
  label: {
    fontSize: 17,
    // marginVertical: 4,
    color: Colors.lightgray,
  },
});
