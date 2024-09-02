import React, { useEffect, useState, useRef } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Text, CheckBox, TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';
import { Switch, StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Colors from '@/Theme/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { LinearGradientButton } from '@/Components';
import { UserState } from '@/Store/User';
import moment from 'moment';
import { InstructionsModal, DeclineActivityModal, MarkAllRollCallModal } from '@/Modals';
import SearchBar from '@/Components/SearchBar/SearchBar';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Modal from 'react-native-modal';
import { useStateValue } from '@/Context/state/State';
import { CreateAttendance, GetAttendance, EditAttendance } from '@/Services/Attendance';
import { SetupVehicleModal } from '@/Modals';
import {
  FindAllStudentsWhichActivity,
  FindAllIstructorActivities,
  SendEmailToPendingStudent,
} from '@/Services/Activity';
const _approvals = [
  {
    name: 'Dylan B.',
    type: 'Student',
    to: false,
    from: false,
  },
  {
    name: 'Peter C.',
    type: 'Student',
    to: false,
    from: false,
  },
  {
    name: 'James B.',
    type: 'Student',
    to: false,
    from: false,
  },
  {
    name: 'Mark K.',
    type: 'Instructor',
    to: false,
    from: false,
  },
  {
    name: 'John B.',
    type: 'Instructor',
    to: false,
    from: false,
  },
];

const RollCallModal = ({ activity, setSelectedActivity, buses, setBuses }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [{ selectedActivity }] = useStateValue();

  const dispatch = useDispatch();
  const [markAll, setMarkAll] = useState(false);

  const [isAttendance, setisAttendance] = useState(false);
  const list = [];
  const [rollCall, setRollCall] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState({});
  const [saved, setSaved] = useState(false);
  const [selectAllTo, setSelectAllTo] = useState(false);
  const [selectAllFrom, setSelectAllFrom] = useState(false);
  const [thumbnail, setThumbnail] = useState(false);
  const [students, setStudents] = useState([]);
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);

  const [instructors, setInstructors] = useState([...list]);

  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.rollCallModalVisibility
  );
  const showVehicle = useSelector((state: { modal: ModalState }) => state.modal.setupVehicleModal);

  const getApprovedStudents = async () => {
    let body = {
      activityId: selectedActivity?.activityId,
      status: 'approved',
      page: 0,
      page_size: 1000,
    };

    // console.log("body", body);
    FindAllStudentsWhichActivity(body)
      .then((res) => {
        addIsToggle(res, [], 'students');
        // setStudents(res);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  // console.log('user', user);
  const getApprovedInstructors = async () => {
    let body = {
      activityId: selectedActivity?.activityId,
      status: 'approved',
      page: 0,
      page_size: 1000,
    };

    FindAllIstructorActivities(body)
      .then((res) => {
        // console.log('current user', currentUser);
        // setInstructors(res);
        let temp = res.filter((item: any) => item?.email != currentUser?.email);
        addIsToggle([], temp, 'instructor');
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  const createAttendance = (stdArr: any, instrArr: any) => {
    let tempStudents = students?.map((item) => ({
      id: item?.studentActivityId,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    let tempInstructors = instructors?.map((item) => ({
      id: item?.instructorActivityId,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item?.journeyStartToOrigin || false,
    }));

    let body = {
      attendanceId: 0,
      activityId: selectedActivity?.activityId,
      student: stdArr || tempStudents,
      instructors: instrArr || tempInstructors,
    };

    CreateAttendance(body)
      .then((res) => {
        Toast.show({
          type: 'success',
          text2: 'Attendance saved Successfully',
        });
      })
      .catch((err) => {
        console.log('err', err);
      });
  };
  const updateAttendance = (stdArr: any, instrArr: any) => {
    let tempStudents = students?.map((item) => ({
      id: item?.id,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    let tempInstructors = instructors?.map((item) => ({
      id: item?.id,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item?.journeyStartToOrigin || false,
    }));
    let body = {
      attendanceId: isAttendance?.attendanceId,
      activityId: selectedActivity?.activityId,
      student: stdArr || tempStudents,
      instructors: instrArr || tempInstructors,
    };

    EditAttendance(body)
      .then((res) => {
        Toast.show({
          type: 'success',
          text2: 'Attendance saved Successfully',
        });
      })
      .catch((err) => {
        console.log('err', err);
      });
  };
  const fetchAttendance = () => {
    GetAttendance(selectedActivity?.activityId)
      .then((res) => {
        // console.log('resss', res.data[0].student);
        if (!res?.data[0]?.attendanceId) {
          getApprovedStudents();
          getApprovedInstructors();
        } else {
          setisAttendance(res.data[0]);
          // if (res?.data[0]?.student?.length != 0 && res?.data[0]?.instructors?.length != 0) {
          //   let toAllStudentsTrue = false;
          //   let toAllInstructorsTrue = false;
          //   res?.data[0]?.student.map((item) => {
          //     if (item?.journeyStartToDestination) {
          //       toAllStudentsTrue = true;
          //     }
          //   });
          //   res?.data[0]?.instructors.map((item) => {
          //     if (item?.journeyStartToDestination) {
          //       toAllInstructorsTrue = true;
          //     }
          //   });
          //   if (toAllInstructorsTrue && toAllStudentsTrue) {
          //     setSelectAllTo(true);
          //   }

          //   if (res?.data[0]?.student?.length > 0 && res?.data[0]?.instructors?.length < 1) {
          //     if (toAllStudentsTrue) {
          //       setSelectAllTo(true);
          //     }
          //   }
          //   if (res?.data[0]?.student?.length < 1 && res?.data[0]?.instructors?.length > 0) {
          //     if (toAllStudentsTrue) {
          //       setSelectAllTo(true);
          //     }
          //   }
          // }
          addIsToggle(res?.data[0]?.student, res?.data[0]?.instructors);
          // setStudents(res?.data?.students);
          // setInstructors(res?.data?.instructors);
        }
        setAttendanceDetail(res?.data);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };
  const addIsToggle = (students, instructors, type) => {
    let tempStudents = students?.map((item) => ({
      ...item,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    let tempInstructors = instructors?.map((item) => ({
      ...item,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));

    type === 'instructor' ? setInstructors(tempInstructors || []) : setStudents(tempStudents || []);
  };

  const handleMarkToAll = (students, instructors) => {
    if (!selectAllTo) {
      let tempStudents = students?.map((item) => ({
        ...item,
        journeyStartToDestination: true,
      }));
      setStudents(tempStudents);

      let tempInstructors = instructors?.map((item) => ({
        ...item,
        journeyStartToDestination: true,
      }));
      setInstructors(tempInstructors);
    }

    if (selectAllTo) {
      let tempStudents = students?.map((item) => ({
        ...item,
        journeyStartToDestination: false,
      }));
      setStudents(tempStudents);
      let tempInstructors = instructors?.map((item) => ({
        ...item,
        journeyStartToDestination: false,
      }));
      setInstructors(tempInstructors);
    }
    setSelectAllTo(!selectAllTo);
  };

  const handleMarkFromAll = (students, instructors) => {
    if (!selectAllFrom) {
      let tempStudents = students?.map((item) => ({
        ...item,

        journeyStartToOrigin: true,
      }));
      setStudents(tempStudents);

      let tempInstructors = instructors?.map((item) => ({
        ...item,

        journeyStartToOrigin: true,
      }));
      setInstructors(tempInstructors);
    }

    if (selectAllFrom) {
      let tempStudents = students?.map((item) => ({
        ...item,

        journeyStartToOrigin: false,
      }));
      setStudents(tempStudents);

      let tempInstructors = instructors?.map((item) => ({
        ...item,

        journeyStartToOrigin: false,
      }));
      setInstructors(tempInstructors);
    }
    setSelectAllFrom(!selectAllFrom);
  };

  useEffect(() => {
    setThumbnail(false);
    if (isFocused) {
      fetchAttendance();
    }
  }, [isFocused]);

  const handleToChange = (index, type) => {
    const data = type == 'student' ? [...students] : [...instructors];
    const item = data[index];
    item.journeyStartToDestination = !item.journeyStartToDestination;
    data[index] = item;
    type == 'student' ? setStudents(data) : setInstructors(data);
  };

  const handleFromChange = (index, type) => {
    const data = type == 'student' ? [...students] : [...instructors];
    const item = data[index];
    item.journeyStartToOrigin = !item.journeyStartToOrigin;
    data[index] = item;
    type == 'student' ? setStudents(data) : setInstructors(data);
  };

  const RightDrawerAction = () => (
    <TopNavigationAction
      icon={(props: any) => <Icon {...props} name="close-circle-outline" fill={Colors.white} />}
      onPress={() => {
        dispatch(ChangeModalState.action({ rollCallModalVisibility: false }));
        setSelectedActivity(null);
      }}
    />
  );

  // @ts-ignore
  return (
    <View>
      <MarkAllRollCallModal
        visible={markAll}
        setVisible={() => {
          setMarkAll(false);
        }}
        onSave={(to, from) => {
          let temp = students.map((item) => ({
            id: item?.id,
            journeyStartToDestination: to,
            journeyStartToOrigin: from,
          }));
          let temp1 = instructors.map((item) => ({
            id: item?.id,
            journeyStartToDestination: to,
            journeyStartToOrigin: from,
          }));

          isAttendance ? updateAttendance(temp, temp1) : createAttendance(temp, temp1);
          setSaved(true);
          setRollCall(false);
        }}
      />
      <View style={{ flex: 1, zIndex: -30 }}>
        <Modal
          propagateSwipe={true}
          coverScreen={true}
          isVisible={isVisible}
          style={{ margin: 0, marginTop: 50 }}
          swipeDirection="down"
          onSwipeComplete={() => {
            dispatch(ChangeModalState.action({ rollCallModalVisibility: false }));
            setSelectedActivity(null);
          }}
          onBackdropPress={() => {
            dispatch(ChangeModalState.action({ rollCallModalVisibility: false }));
            setSelectedActivity(null);
          }}
          onBackButtonPress={() => {
            dispatch(ChangeModalState.action({ rollCallModalVisibility: false }));
            setSelectedActivity(null);
          }}
        >
          <>
            <View style={styles.background}>
              <TopNavigation
                style={styles.topNav}
                title={() => (
                  <Text
                    style={{
                      color: Colors.white,
                      marginLeft: 20,
                      fontSize: 18,
                    }}
                  >
                    Trip: {activity?.activityName || ''}
                  </Text>
                )}
                appearance="control"
                alignment="start"
                accessoryRight={RightDrawerAction}
              />
            </View>

            <View style={{ flex: 1, backgroundColor: Colors.white }}>
              <View style={styles.layout}>
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                  <View
                    style={{
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                      marginTop: 10,
                      flexDirection: 'row',
                    }}
                  >
                    <Text>Use Bus Configuration</Text>
                    <Switch
                      style={{ marginLeft: 20 }}
                      trackColor={{ false: '#767577', true: '#50CBC7' }}
                      thumbColor={Colors.white}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setThumbnail(!thumbnail);
                        if (attendanceDetail.length > 0 && attendanceDetail[0]?.buses?.length > 0) {
                          navigation.navigate('DragDropStudent', {
                            bus: { busId: attendanceDetail[0]?.buses[0] },
                            students: students,
                            activity: activity,
                            attendanceMark: true,
                          });
                        } else {
                          dispatch(
                            ChangeModalState.action({
                              setupVehicleModal: true,
                              rollCallModalVisibility: false,
                            })
                          );
                        }
                      }}
                      value={thumbnail}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 10,
                    }}
                  >
                    <Text>{`To`}</Text>
                    <Text style={{ marginLeft: 10 }}>{`From`}</Text>
                  </View>
                  {rollCall && (
                    <View
                      style={{
                        marginVertical: 2,
                        padding: 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          // alignItems: 'center',
                        }}
                      >
                        <Text style={{ marginLeft: 10, marginRight: 30 }}>Select All</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <CheckBox
                          checked={selectAllTo}
                          disabled={saved}
                          onChange={() => handleMarkToAll(students, instructors)}
                        >
                          {''}
                        </CheckBox>
                        <CheckBox
                          checked={selectAllFrom}
                          disabled={saved}
                          style={{ marginLeft: 30 }}
                          onChange={() => handleMarkFromAll(students, instructors)}
                        >
                          {''}
                        </CheckBox>
                      </View>
                    </View>
                  )}
                  <View style={{ marginTop: 10, maxHeight: 150 }}>
                    <FlatList
                      data={students}
                      keyExtractor={(item, index) => 'key' + index}
                      renderItem={({ item, index }) => (
                        <View
                          style={{
                            marginVertical: 2,
                            padding: 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            {item.type === 'Instructor' ? (
                              <Ionicons
                                name="person"
                                color={Colors.secondaryDark}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                              />
                            ) : (
                              <Entypo
                                name="book"
                                color={Colors.secondaryDark}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                              />
                            )}
                            <Text style={{ marginLeft: 10 }}>{`${
                              item?.firstName || item?.firstname
                            } ${item?.lastName || item?.lastname}`}</Text>
                          </View>
                          {(rollCall || saved) && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <CheckBox
                                checked={item?.journeyStartToDestination}
                                disabled={saved}
                                onChange={() => handleToChange(index, 'student')}
                              >
                                {''}
                              </CheckBox>
                              <CheckBox
                                checked={item?.journeyStartToOrigin}
                                disabled={saved}
                                style={{ marginLeft: 30 }}
                                onChange={() => handleFromChange(index, 'student')}
                              >
                                {''}
                              </CheckBox>
                            </View>
                          )}
                        </View>
                      )}
                    />
                    <FlatList
                      data={instructors}
                      keyExtractor={(item, index) => 'key' + index}
                      renderItem={({ item, index }) => (
                        <View
                          style={{
                            marginVertical: 2,
                            padding: 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons
                              name="person"
                              color={Colors.secondaryDark}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                            />

                            <Text
                              style={{ marginLeft: 10 }}
                            >{`${item.firstName} ${item.lastName}`}</Text>
                          </View>
                          {(rollCall || saved) && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <CheckBox
                                checked={item?.journeyStartToDestination}
                                disabled={saved}
                                onChange={() => handleToChange(index, 'instructor')}
                              >
                                {''}
                              </CheckBox>
                              <CheckBox
                                checked={item?.journeyStartToOrigin}
                                disabled={saved}
                                style={{ marginLeft: 30 }}
                                onChange={() => handleFromChange(index, 'instructor')}
                              >
                                {''}
                              </CheckBox>
                            </View>
                          )}
                        </View>
                      )}
                    />
                  </View>
                </View>
                <View
                  style={{
                    bottom: 30,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    width: '90%',
                    alignSelf: 'center',
                  }}
                >
                  {!rollCall && (
                    <>
                      <LinearGradientButton
                        onPress={() => {
                          setSaved(false);
                          setRollCall(true);
                        }}
                      >
                        Roll Call
                      </LinearGradientButton>

                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            ChangeModalState.action({
                              rollCallModalVisibility: false,
                            })
                          );
                          setSelectedActivity(null);
                        }}
                      >
                        <Text style={[styles.button, { color: Colors.primary }]}>Close</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={{ marginVertical: 10 }} />
                  {rollCall && (
                    <LinearGradientButton
                      gradient={[Colors.primaryLight, Colors.primaryDark]}
                      onPress={() => {
                        isAttendance ? updateAttendance() : createAttendance();
                        setSaved(true);
                        setRollCall(false);
                      }}
                    >
                      Save
                    </LinearGradientButton>
                  )}
                </View>
              </View>
            </View>
          </>
        </Modal>
      </View>
    </View>
  );
};
export default RollCallModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  topNav: {
    color: Colors.white,
  },
  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: '2%',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginHorizontal: '2%',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  bottomButton: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
