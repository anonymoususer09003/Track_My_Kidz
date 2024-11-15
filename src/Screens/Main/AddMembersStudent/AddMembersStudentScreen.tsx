import React, { FC, useEffect, useState } from 'react';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { Text } from '@ui-kitten/components';
import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { LinearGradientButton } from '@/Components';
import ChangeModalState from '@/Store/Modal/ChangeModalState';

import Colors from '@/Theme/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';

import ChangeAddMembersStudentsState from '@/Store/AddMembersStudents/ChangeAddMembersStudentsState';
import { useStateValue } from '@/Context/state/State';
import { actions } from '@/Context/state/Reducer';
import { AddIndividialMembersModal } from '@/Modals';
import { AddMembersNavigatorParamList } from '@/Navigators/Main/AddMembersNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

type AddMembersStudentScreenProps = {
  route: RouteProp<AddMembersNavigatorParamList, 'AddMembersStudent'>;
};
const AddMembersStudentScreen: FC<AddMembersStudentScreenProps> = ({ route }) => {
  const isFocused = useIsFocused();
  const [{ group, students }, _dispatch]: any = useStateValue();
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  // const studentss = useSelector(
  //   (state: { students: AddMembersStudentsState }) => state.students?.students,
  // );
  const dispatch = useDispatch();

  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);

  const [askPermission, setAskPermission] = useState<boolean>(false);
  // const [students, setStudents] = useState<any[]>([]);
  const [deletedStudents, setDeletedStudents] = useState<any[]>([]);
  const [deletedInstructors, setDeletedInstructors] = useState<any[]>([]);

  const handleSelectStudent = (index: number, status: any) => {
    const data = [...students];
    if (status) {
      const item = data[index];

      const _selectedStudents = [...selectedStudents];
      _selectedStudents.push(item);
      setSelectedStudents(_selectedStudents);
      dispatch(
        ChangeAddMembersStudentsState.action({
          students: _selectedStudents,
        })
      );
    } else {
      const item = selectedStudents[index];

      let _selectedStudents = [...selectedStudents];
      _selectedStudents = _selectedStudents.filter((i) => i !== item);
      setSelectedStudents(_selectedStudents);
      const filterDeletedInstrutors = deletedInstructors.filter(
        (instructor) => instructor?.email != item?.email
      );
      setDeletedInstructors(filterDeletedInstrutors);
      dispatch(
        ChangeAddMembersStudentsState.action({
          students: _selectedStudents,
        })
      );
    }
  };

  const handleSubmit = () => {
    let addStudents = [...students];
    let temp: any[] = [];
    if (group?.isEdit) {
      addStudents.map((item) => {
        if (!item?.studentId) {
          temp.push(item);
        }
      });
    }
    addStudents = group?.isEdit ? temp : [...students];
    let filter = addStudents.filter((s) => s?.firstName !== '');

    _dispatch({
      type: actions.SET_GROUP,
      payload: {
        ...group,
        deletedStudent: group?.isEdit ? deletedStudents : false,
        students: addStudents.filter((s) => s?.name !== ''),
      },
    });

    navigation.navigate('AddMembers', {
      screen: 'AddMembersInstructor',
      data: !!group?.isEdit,
    });
  };

  const handleRemoveStudent = (item: any) => {
    let data = [...students];

    if (!item?.studentId) {
      data = data.filter((d) => d.parent1_email !== item.parent1_email);
    } else {
      setDeletedStudents([...deletedStudents, item]);
      data = data.filter((d) => d?.studentId !== item?.studentId);
    }
    _dispatch({
      type: actions.SET_GROUPS_STUDENTS,
      payload: data,
    });
    // setStudents(data);
  };
  const resetFields = () => {
    dispatch(
      ChangeAddMembersStudentsState.action({
        students: [],
      })
    );
    setSelectedStudents([]);
    setAskPermission(false);
  };

  useEffect(() => {
    setSelectedStudents([]);
    setAskPermission(false);
    // setStudents([]);
    if (isFocused && group?.isEdit) {
      _dispatch({
        type: actions.SET_GROUPS_STUDENTS,
        payload: group?.isEdit?.students,
      });
      // setStudents(group?.isEdit?.students);
      // setSelectedStudents([...group?.isEdit?.students]);
    }
  }, [isFocused]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}>
      <AddIndividialMembersModal individuals={students} setIndividuals={() => null} hideImport />
      <View style={styles.layout}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            backgroundColor: Colors.newBackgroundColor,
          }}
        >
          <View
            style={{
              marginVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                color: Colors.primary,
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              Add Students
            </Text>

            <TouchableOpacity
              onPress={() =>
                dispatch(
                  ChangeModalState.action({
                    addIndividualMemberModalVisibility: true,
                  })
                )
              }
            >
              <Image
                source={require('@/Assets/Images/add.png')}
                style={{
                  height: 24,
                  width: 24,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={students}
              style={{ minHeight: 320 }}
              nestedScrollEnabled
              renderItem={({ item, index }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 2.5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text>{item.name}</Text>
                  </View>
                  <AntDesign
                    name="delete"
                    color={Colors.primary}
                    size={20}
                    style={{ marginHorizontal: 5 }}
                    onPress={() => handleRemoveStudent(item)}
                  />
                </View>
              )}
            />
          </View>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={selectedStudents}
              nestedScrollEnabled
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => handleSelectStudent(index, false)}
                  style={[
                    styles.participantsListCards,
                    {
                      borderBottomWidth: students.length != index + 1 ? 2 : 0,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View>
                      <Text>{item?.name}</Text>
                      <Text>{item?.parent1_email}</Text>
                    </View>
                  </View>
                  <AntDesign
                    name="delete"
                    color={Colors.primary}
                    size={20}
                    style={{ marginHorizontal: 5 }}
                    onPress={() => handleRemoveStudent(item)}
                  />
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={[styles.buttonSettings, { paddingBottom: 20 }]}>
            <LinearGradientButton
              disabled={students.filter((s) => s.firstName !== '').length === 0}
              onPress={handleSubmit}
            >
              {route?.params ? 'Edit Members' : 'Add Members'}
            </LinearGradientButton>
            <View style={{ marginTop: 20 }} />
            <LinearGradientButton
              gradient={['#EC5ADD', Colors.primary]}
              onPress={() => {
                resetFields();
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'InstructorActivity',
                    },
                  ],
                });
              }}
            >
              Cancel
            </LinearGradientButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddMembersStudentScreen;

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
    backgroundColor: Colors.primary,
  },
  bottomButton: {
    width: '60%',
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
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: '25%',
    flexDirection: 'column',

    alignItems: 'center',
    width: '80%',
    marginLeft: '10%',

    // alignItems: "center",
    // justifyContent: "flex-start",
  },
  errorText: {
    fontSize: 10,
    color: 'red',
    marginLeft: 10,
    marginTop: 10,
  },
  participantContainer: {
    width: '80%',
    marginVertical: 5,
    marginLeft: '5%',
  },
  participantListView: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    padding: 5,
    elevation: 2,
  },
  participantsListCards: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
    borderColor: Colors.newBackgroundColor,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
});
