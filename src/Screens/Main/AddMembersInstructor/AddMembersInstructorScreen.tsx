import React, { useEffect, useState, useRef, FC } from 'react';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { Text, Icon, Input, Select, SelectItem, CheckBox, useTheme } from '@ui-kitten/components';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Colors from '@/Theme/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { LinearGradientButton } from '@/Components';
import { InstructionsModal } from '@/Modals';
import { Formik } from 'formik';
import { AppHeader } from '@/Components';
import Toast from 'react-native-toast-message';
import { AddMembersStudentsState } from '@/Store/AddMembersStudents';
import ChangeAddMembersStudentsState from '@/Store/AddMembersStudents/ChangeAddMembersStudentsState';
import { GetAllInstructors } from '@/Services/Instructor';
import {
  CreateGroup,
  NotifyToInstructors,
  NotifyToParent,
  UpdateGroup,
  DeleteParticipant,
} from '@/Services/Group';
import { useStateValue } from '@/Context/state/State';
import { actions } from '@/Context/state/Reducer';
import FetchOne from '@/Services/User/FetchOne';
import { loadUserId, loadUserType } from '@/Storage/MainAppStorage';
import { GetInstructor, FindInstructorBySchoolOrg } from '@/Services/Instructor';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { AddMembersNavigatorParamList } from '@/Navigators/Main/AddMembersNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

const AddMembersInstructorScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  const [{ group, orgInstructors, students }, _dispatch]: any = useStateValue();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [selectedInstructors, setSelectedInstructors] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [deletedInstructors, setDeletedInstructors] = useState<any[]>([]);
  // const students = useSelector(
  //   (state: { students: AddMembersStudentsState }) => state.students?.students
  // );

  const [askPermission, setAskPermission] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const getInstructor = async () => {
    const userId = await loadUserId();

    if (!userId) return;

    GetInstructor(userId)
      .then((res) => {
        setUser(res);
        FindInstructorBySchoolOrg({
          schoolId: res?.schoolId,

          orgId: res?.orgId || null,
        })
          .then((instructors) => {
            setInstructors(instructors);
            // setOrgInfo(org);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };

  useEffect(() => {
    // loadUserDetails();

    if (isFocused) {
      // if (orgInstructors?.result) {
      //   setSelectedInstructors(orgInstructors?.result);
      // }
      getInstructor();
    }
    if (group?.isEdit) {
      setSelectedInstructors(group?.isEdit?.instructors);
    }
    // getAllInstructors();
  }, [isFocused]);

  const handleSelectInstructor = (index: number, status: any) => {
    const data = [...instructors];
    if (status) {
      const item = data[index];

      // console.log("if", item);
      const filterDeletedInstrutors = deletedInstructors.filter(
        (instructor) => instructor?.email != item?.email
      );
      setDeletedInstructors(filterDeletedInstrutors);
      const _selectedInstructors = [...selectedInstructors];
      if (!_selectedInstructors.find((i) => i?.instructorId === item?.instructorId)) {
        _selectedInstructors.push(item);
        setSelectedInstructors(_selectedInstructors);
      }
    } else {
      const item = selectedInstructors[index];
      if (group?.isEdit) {
      }
      const filterDeletedInstrutors = deletedInstructors.filter(
        (instructor) => instructor?.email != item?.email
      );
      setDeletedInstructors([...deletedInstructors, item]);
      let _selectedInstructors = [...selectedInstructors];
      _selectedInstructors = _selectedInstructors.filter(
        (i) => i?.instructorId !== item?.instructorId
      );
      setSelectedInstructors(_selectedInstructors);
    }
  };

  const handleSubmit = () => {
    const data = {
      ...group,

      students: [],
      instructors: [],
      status: 'approved',
      schoolId: user?.schoolId || null,
      orgId: user?.orgId || null,
      aggrement: true,
      requestPermission: true,
      optin: {
        ...group.optin,

        status: true,
      },
      schedule: {
        recurrence: 0,
        fromDate: new Date(),
        toDate: new Date(),
        days: '0000000',
        status: 'enabled',
      },
    };
    try {
      dispatch(ChangeModalState.action({ loading: true }));
      if (group?.isEdit) {
        data['id'] = group?.isEdit?.groupId;
      }
      delete data['isEdit'];

      if (!group?.isEdit) {
        CreateGroup(data)
          .then(async (res) => {
            Toast.show({
              type: 'success',
              text2: 'Permission request has been sent to parents and invited instructors',
            });

            const _students = students?.map((item: any) => ({
              firstName: item?.name?.split(' ')[0],
              lastName: item?.name?.split(' ')[1],
              parentEmail1: item?.parent1_email,
              parentEmail2: item?.parent2_email,
            }));

            try {
              let notifyToParents = await NotifyToParent(res?.groupId, _students);

              const _instructors: any[] = [];
              let notifyToInstructor;

              if (!group?.isEdit && selectedInstructors) {
                selectedInstructors.map((item) => {
                  _instructors.push({
                    firstName: item?.firstname,
                    lastName: item?.lastname,
                    email: item?.email,
                  });
                });

                notifyToInstructor = await NotifyToInstructors(res?.groupId, _instructors);
              } else {
                notifyToInstructor = true;
              }

              dispatch(ChangeModalState.action({ loading: false }));
              if (notifyToParents && notifyToInstructor) {
                _dispatch({
                  type: actions.SET_GROUP,
                  payload: null,
                });
                _dispatch({
                  type: actions.SET_GROUPS_STUDENTS,
                  payload: [],
                });
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'InstructorActivity',
                      params: {
                        screen: 'InstructorGroup',
                      },
                    },
                  ],
                });
                setAskPermission(false);
                dispatch(
                  ChangeAddMembersStudentsState.action({
                    students: [],
                  })
                );

                setSelectedInstructors([]);
              }
            } catch (err) {
              dispatch(ChangeModalState.action({ loading: false }));
              console.log('err', err);
              Toast.show({
                type: 'success',
                text2: 'Something went wrong',
              });
            }
          })
          .catch((err) => {
            console.log('CreateGroup', err);
          });
      } else {
        UpdateGroup(data)
          .then(async (res) => {
            Toast.show({
              type: 'success',
              text2: 'Permission request has been sent to parents and invited instructors',
            });

            // console.log("group", group);
            const _students = group?.students?.map((item: any) => ({
              firstName: item?.name?.split(' ')[0],
              lastName: item?.item?.name?.split(' ')[1] || '',
              parentEmail1: item?.parent1_email,
              parentEmail2: item?.parent2_email,
            }));

            try {
              let notifyToParents = true;
              if (_students && _students?.length > 0) {
                notifyToParents = false;
                notifyToParents = await NotifyToParent(group?.isEdit?.groupId, _students);
                notifyToParents = true;
              }

              const _instructors = selectedInstructors.map((item) => ({
                firstName: item?.firstname,
                lastName: item?.lastname,
                email: item?.email,
              }));

              dispatch(ChangeModalState.action({ loading: false }));
              let notifyToInstructor = true;
              if (_instructors?.length > 0) {
                notifyToInstructor = false;
                await NotifyToInstructors(group?.isEdit?.groupId, _instructors);
                notifyToInstructor = true;
              }

              if (notifyToParents && notifyToInstructor) {
                setDeletedInstructors([]);
                _dispatch({
                  type: actions.SET_GROUP,
                  payload: null,
                });
                _dispatch({
                  type: actions.SET_GROUPS_STUDENTS,
                  payload: [],
                });
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'InstructorActivity',
                      params: {
                        screen: 'InstructorGroup',
                      },
                    },
                  ],
                });
                setAskPermission(false);
                dispatch(
                  ChangeAddMembersStudentsState.action({
                    students: [],
                  })
                );
                setSelectedInstructors([]);
              }
              let deletedInstructor: any[] = [];
              let deletedStudents: any[] = [];
              deletedInstructors.map((item) => {
                deletedInstructor.push(item?.instructorId);
              });
              if (group?.deletedStudent) {
                group?.deletedStudent.map((item: any) => {
                  deletedStudents.push(item?.studentId);
                });
              }
              let deleteParticipant = await DeleteParticipant({
                studentId: deletedStudents.length == 0 ? [0] : deletedStudents,
                instructorId: deletedInstructor.length == 0 ? [0] : deletedInstructor,
                groupId: group?.isEdit?.groupId,
              });
            } catch (err) {
              dispatch(ChangeModalState.action({ loading: false }));
              console.log('err', err);
              Toast.show({
                type: 'success',
                text2: 'Something went wrong',
              });
            }
          })
          .catch((err) => {
            console.log('CreateGroup', err);
            dispatch(ChangeModalState.action({ loading: false }));
          });
      }
    } catch (err) {
      console.log('err', err);
      dispatch(ChangeModalState.action({ loading: false }));
    }
  };

  return (
    <ScrollView>
      <View style={styles.layout}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={instructors}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{
                    marginVertical: 2,
                    padding: 2,
                    backgroundColor: selectedInstructors.find((i) => i === item)
                      ? Colors.primary
                      : 'transparent',
                  }}
                  onPress={() => handleSelectInstructor(index, true)}
                >
                  <Text
                    style={{
                      color: selectedInstructors.find((i) => i === item)
                        ? Colors.white
                        : Colors.black,
                    }}
                  >
                    {`${item.firstname} ${item.lastname}`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={{ marginVertical: 5 }}>
            <Text
              style={{ textAlign: 'center' }}
            >{`Selection: ${selectedInstructors?.length}`}</Text>
          </View>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={selectedInstructors}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{
                    marginVertical: 2,
                    padding: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => handleSelectInstructor(index, false)}
                >
                  <Text>{`${item.firstname} ${item.lastname}`}</Text>
                  <AntDesign name="close" color={Colors.primary} size={20} />
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={{ marginVertical: 20 }}>
            {/* <CheckBox
              style={{ marginLeft: 20 }}
              checked={askPermission}
              onChange={() => setAskPermission(!askPermission)}
            >
              Request Permission from instructor
            </CheckBox> */}
          </View>
          <View style={styles.buttonSettings}>
            <View style={[styles.background]}>
              <LinearGradientButton onPress={handleSubmit}>
                {group?.isEdit ? 'Update Group' : 'Invite to Group'}
              </LinearGradientButton>
            </View>
            <View style={styles.background}>
              <LinearGradientButton
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'InstructorActivity',
                        params: {
                          screen: 'InstructorGroup',
                        },
                      },
                    ],
                  });
                  setAskPermission(false);
                  dispatch(
                    ChangeAddMembersStudentsState.action({
                      students: [],
                    })
                  );
                  _dispatch({
                    type: actions.SET_GROUP,
                    payload: null,
                  });
                  setSelectedInstructors([]);
                }}
              >
                Cancel
              </LinearGradientButton>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddMembersInstructorScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 20,
    backgroundColor: Colors.newBackgroundColor,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sent: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  background: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    // backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 70,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  errorText: {
    fontSize: 10,
    color: 'red',
    marginLeft: 10,
    marginTop: 10,
  },
});
