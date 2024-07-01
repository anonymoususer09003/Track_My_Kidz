import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Text } from '@ui-kitten/components';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Colors from '@/Theme/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import { InstructionsModal, ShowStudentsInstructorsGroupModal } from '@/Modals';
import { useStateValue } from '@/Context/state/State';
import { FindGroupsByName, GetGroupByStudentId, GetGroupCount } from '@/Services/Group';
import { UserState } from '@/Store/User';
import SetChatParam from '@/Store/chat/SetChatParams';
import Ionicons from 'react-native-vector-icons/Ionicons';
import setHeaderParams from '@/Store/header/setHeaderParams';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { ModalState } from '@/Store/Modal';
import { CHILDREN_FROM_PARENT_GROUP_SCREEN } from '@/Constants';
import { AppHeader } from '@/Components';
const children = CHILDREN_FROM_PARENT_GROUP_SCREEN;

const GroupScreen = () => {
  const instructorImage = require('@/Assets/Images/approval_icon2.png');
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  const isFocused = useIsFocused();
  // const swipeableRef = useRef(null);
  const dispatch = useDispatch();

  const [{ selectedDependentActivity, child }]: any = useStateValue();
  // const [selectedInstructorGroup, setSelectedInstructorGroup] = useState(null);
  const [selectionData, setSelectionData] = useState<any>({
    type: 'student',
    status: 'pending',
    group: null,
  });
  let prevOpenedRow: any;
  let row: Array<any> = [];

  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] =
    useState<boolean>(false);
  const searchBarValue = useSelector(
    (state: any) => state.header.searchBarValue,
  );
  const [selectedInstructions, setSelectedInstructions] = useState<any>(null);
  // const dependent = route && route.params && route.params.dependent;

  const currentUser: any = useSelector(
    (state: { user: UserState }) => state.user.item,
  );
  const [groupCount, setGroupCount] = useState<any>({});
  // const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  // const [loading, setLoading] = useState(true);
  // const [thumbnail, setThumbnail] = useState(false);
  // const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.instructionsModalVisibility,
  );
  const [groups, setGroups] = useState<any[]>([]);

  const getGroups = async () => {
    GetGroupByStudentId(child?.studentId)
      .then((res) => {
        setGroups(res);
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };

  const search = (text: String) => {
    if (text == '') {
      getGroups();
    } else {
      FindGroupsByName({ groupName: text }, 0, 30)
        .then((res) => {
          setGroups(res?.result);
        })
        .catch((err) => {
          console.log('Error:', err);
        });
    }
  };

  useEffect(() => {
    if (isFocused) {
      getGroups();
    } else {
      dispatch(
        setHeaderParams.action({
          selectedDropDownOption: '',
          searchBarValue: '',
        }),
      );
    }
  }, [isFocused]);
  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  const getGroupCountApi = async (body: any) => {
    try {
      let temp: any = {};
      let res: any[] = await GetGroupCount(body);
      res.map((item) => {
        temp[item.groupId] = item;
      });
      setGroupCount({ ...groupCount, ...temp });
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    if (isFocused) {
      let temp: any[] = [];
      if (groups?.length > 0) {
        groups?.forEach(async (element) => {
          temp.push(element.groupId);
        });
        getGroupCountApi(temp);
        // getGroupCountApi(temp);
      }
    }
  }, [groups?.length, isFocused]);

  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    useEffect(()=>{

    },[])
    return (
      <>
         <AppHeader isCalendar={true} />
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            dispatch(
              SetChatParam.action({
                title: item?.groupName,
                chatId: `activity_${item?.groupId}`,
                subcollection: 'student',
                user: {
                  _id: currentUser?.studentId,
                  avatar: currentUser?.imageurl,
                  name: currentUser?.firstname
                    ? currentUser?.firstname[0].toUpperCase() +
                    currentUser?.firstname.slice(1) +
                    ' ' +
                    currentUser?.lastname[0].toUpperCase()
                    : currentUser?.firstname + '' + currentUser?.lastname,
                },
              }),
            );
            navigation.navigate('ChatScreen', {
              title: item?.groupName,
              showHeader: true,
            });
          }}
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons size={25} color={Colors.primary} name="chatbox-ellipses" />
        </TouchableOpacity>
        {!item.status && (
          <TouchableOpacity
            onPress={() => setSelectedDependent(item)}
            style={{
              padding: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              style={{ width: 30, height: 30 }}
              fill={Colors.primary}
              name="trash"
            />
          </TouchableOpacity>
        )}
      </View>
      </>
    );
  };
  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow?.close();
    }
    prevOpenedRow = row[index];
  };

  useEffect(() => {
    if (searchBarValue) {
      search(searchBarValue);
    }
  }, [searchBarValue]);

  return (
    <>
       <AppHeader hideCalendar={true} isCalendar={true} />
      {isVisible && (
        <InstructionsModal
          group={selectedInstructions}
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}

      {showStudentsInstructorsModal && (
        <ShowStudentsInstructorsGroupModal
          isVisible={showStudentsInstructorsModal}
          setIsVisible={() => {
            setShowStudentsInstructorsModal(false);
          }}
          status={selectionData.status}
          type={selectionData.type}
          group={selectionData.group}
        />
      )}

      <View style={styles.layout}>
        {groups.length > 0 && (
          <FlatList
            data={groups || []}
            style={{
              padding: 10,
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
            }}
            renderItem={({ item, index }) => {
              let temp: any[] = [];
              let instructor = item?.instructors?.map((item: any) =>
                temp.push(item?.firstName),
              );
              return (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <View style={[styles.item, { backgroundColor: '#fff' }]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 20,
                          fontWeight: '800',
                          paddingLeft: 25,
                        },
                      ]}
                    >{`${item?.groupName}`}</Text>
                    {/* <Text style={styles.text}>{`Status: ${
          item?.status ? "Active" : "Inactive"
        }`}</Text> */}

                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 12,
                          fontWeight: '700',
                          paddingLeft: 25,
                        },
                      ]}
                    >{`Instructors: ${temp.toString()}`}</Text>
                    <View style={styles.divider}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.text}>{`Approval`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              setSelectionData({
                                status: 'approved',
                                type: 'student',
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.footerText}>{`${
                              groupCount[item.groupId]?.countApprovedStudents ||
                              '0'
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
                              setSelectionData({
                                status: 'approved',
                                type: 'instructor',
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {groupCount[item.groupId]
                                ?.countApprovedInstructors || '0'}
                            </Text>
                            <Image
                              source={instructorImage}
                              style={styles.iconImages}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Declined`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              setSelectionData({
                                status: 'declined',
                                type: 'student',
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>{`${
                              groupCount[item.groupId]?.countDeclinedStudents ||
                              '0'
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
                              setSelectionData({
                                status: 'declined',
                                type: 'instructor',
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {groupCount[item.groupId]
                                ?.countDeclinedInstructors || '0'}
                            </Text>
                            <Image
                              source={instructorImage}
                              style={styles.iconImages}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Pending`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectionData({
                                status: 'pending',
                                type: 'student',
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                            style={styles.horizontal}
                          >
                            <Text style={styles.text}>
                              {`${
                                groupCount[item.groupId]
                                  ?.countPendingStudents || '0'
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
                              setSelectionData({
                                status: 'pending',
                                type: 'instructor',
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {groupCount[item.groupId]
                                ?.countPendingInstructors || '0'}
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

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedInstructions(item);
                        dispatch(
                          ChangeModalState.action({
                            instructionsModalVisibility: true,
                          }),
                        );
                      }}
                      style={{ width: '100%', alignItems: 'center' }}
                    >
                      <Text
                        style={[
                          styles.text,
                          {
                            fontSize: 16,
                            marginVertical: 15,
                            opacity: 0.6,
                          },
                        ]}
                      >{`Instructions     /    Disclaimer    /    Agreement`}</Text>
                    </TouchableOpacity>
                  </View>
                </Swipeable>
              );
            }}
          />
        )}
      </View>
    </>
  );
};

export default GroupScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 15,
    width: '96%',
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: '2%',
    // paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 205,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    marginVertical: 4,
  },

  iconImages: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
    marginLeft: 5,
    marginRight: 5,
  },
  footerText: {
    fontSize: 13,
    marginVertical: 2,
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
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.lightgray,
    paddingVertical: 10,
    marginVertical: 10,
  },
});
