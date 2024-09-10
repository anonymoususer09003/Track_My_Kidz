import { Icon, Text } from '@ui-kitten/components';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { DeclineActivityModal, InstructionsModal } from '@/Modals';
import ChildrenSelectionModal from '@/Modals/ChildrenSelectionModal';
import { GetChildrenAcitivities } from '@/Services/Activity';
import { GetChildrenGroups } from '@/Services/Group';
import GetParentChildrens from '@/Services/Parent/GetParentChildrens';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import Colors from '@/Theme/Colors';

const ParentApprovalScreen = () => {
  const instructorImage = require('@/Assets/Images/approval_icon2.png');
  const calendarIcon = require('@/Assets/Images/navigation_icon2.png');
  // const calendarIcon = require("@/Assets/Images/navigation_icon2.png");
  const marker = require('@/Assets/Images/marker.png');

  // const email = require("@/Assets/Images/email.png");
  // const clockIcon = require("@/Assets/Images/clock1.png");
  // const instructorImage = require("@/Assets/Images/approval_icon2.png");
  // const navigation = useNavigation();
  const isFocused = useIsFocused();
  // const dependent = route && route.params && route.params.dependent;
  // const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  // const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  // const [loading, setLoading] = useState(true);
  // const [thumbnail, setThumbnail] = useState(false);
  // const [searchParam, setSearchParam] = useState("");
  const [group, setSelectedGroup] = useState(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<any>(null);
  const [declineActivity, setDeclineActivity] = useState<any>(null);
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);
  // const [activity, setActivity] = useState(null);
  let prevOpenedRow: any;
  let row: any[] = [];
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [pageGroup, pageNumberGroup] = useState<number>(0);
  const [pageSizeGroup, setPageSizeGroup] = useState<number>(10);
  const [totalRecordsGroup, setTotalRecordsGroup] = useState<number>(0);

  const [pageActivity, pageNumberActivity] = useState<number>(0);
  const [pageSizeActivity, setPageSizeActivity] = useState<number>(10);
  const [totalRecordsActivity, setTotalRecordsActivity] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedChild, setSelectedChild] = useState<any>('');

  const getActivities = async (refreshing?: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    let pageNumberActivityCount = refreshing ? pageActivity : 0;
    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    let email = currentUser?.email;
    GetChildrenAcitivities(
      email,
      'approved',

      pageNumberActivityCount,
      pageSizeActivity
    )
      .then((res) => {
        setTotalRecordsActivity(res.totalRecords);
        setRefreshing(false);
        setPageSizeActivity(10);

        pageNumberActivity(refreshing ? pageActivity + 1 : 1);

        if (refreshing) {
          setActivities([...activities, ...res.result]);
        } else {
          setActivities(res.result);
        }
      })
      .catch((err) => {
        console.log('Error:', err);
        setRefreshing(false);
        setPageSizeActivity(10);

        pageNumberActivity(pageActivity);
      });
  };

  const getGroups = async (refreshing?: any) => {
    if (refreshing) {
      setRefreshing(true);
    }

    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    let email = currentUser?.email;
    GetChildrenGroups(email, 'approved', pageNumberGroupCount, pageSizeGroup)
      .then((res) => {
        setTotalRecordsGroup(res.totalRecords);
        setRefreshing(false);
        setPageSizeGroup(10);

        pageNumberGroup(refreshing ? pageGroup + 1 : 1);

        if (refreshing) {
          setGroups([...groups, ...res?.result]);
        } else {
          setGroups(res.result);
        }
        // setGroups(res);
      })
      .catch((err) => {
        setRefreshing(false);
        setPageSizeGroup(10);

        pageNumberGroup(pageGroup);
        console.log('Error:', err);
      });
  };

  const loadUserDetails = async () => {
    GetParentChildrens(currentUser?.referenceCode)
      .then((res) => {
        setChildren(res);
      })
      .catch((err) => console.log('loadUserDetails', err));
  };
  useEffect(() => {
    loadUserDetails();
  }, []);
  useEffect(() => {
    if (isFocused || declineActivity) {
      getActivities();
      getGroups();
    }
  }, [isFocused, declineActivity]);
  const closeRow = (index: number) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            dispatch(
              ChangeModalState.action({
                childrenSelectionModalVisibility: true,
              })
            );
            setDeclineActivity(item);
          }}
        >
          {item.status ? (
            <AntDesign size={30} name="dislike2" color={Colors.primary} />
          ) : (
            <Icon style={{ width: 30, height: 30 }} fill={Colors.primary} name="trash" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <InstructionsModal
        group={group}
        selectedInstructions={selectedInstructions}
        setSelectedInstructions={() => {
          setSelectedInstructions(null);
          setSelectedGroup(null);
        }}
        activity={selectedInstructions?.activity}
      />
      {declineActivity && (
        <ChildrenSelectionModal
          acceptModal={false}
          setSelectedChild={setSelectedChild}
          activity={declineActivity}
          children={children}
        />
      )}

      {declineActivity && !!selectedChild && (
        <DeclineActivityModal
          fromParent={true}
          activity={{
            ...declineActivity,
            selectedStudentId: selectedChild.studentId,
          }}
          setActivity={(id: any) => {
            setSelectedChild('');
            if (declineActivity?.activity) {
              let filter = activities.filter((item) => item?.activity?.activityId != id);
              setDeclineActivity(false);
              setActivities(filter);
            } else {
              let filter = groups.filter((item) => item?.group?.groupId != id);
              setGroups(filter);
            }
          }}
        />
      )}

      <View style={styles.layout}>
        {activities.length === 0 && groups.length == 0 && (
          <View style={{ padding: 10, backgroundColor: Colors.newBackgroundColor }}>
            <Text style={[styles.text, { textAlign: 'center' }]}>
              You do not have any approved activities or groups
            </Text>
          </View>
        )}

        <View style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}>
          <FlatList
            data={[...activities, ...groups]}
            // style={{ padding: 20, width: "100%" }}
            renderItem={({ item }) => {
              if (item?.activity?.activityId) {
                let date = item?.activity?.fromDate;

                return (
                  <Swipeable
                    ref={(ref) => (row[item?.activity?.activityId] = ref)}
                    onSwipeableOpen={() => closeRow(item?.activity?.activityId)}
                    renderRightActions={(e) => RightActions(e, item)}
                  >
                    {/* <View style={[styles.item]}><
                    <TouchableOpacity
                        onPress={() => setSelectedInstructions(item?.activity?.optin)}
                        style={[styles.footer, { backgroundColor: "#fff" }]}
                      >
                        <Text style={[styles.text, { fontSize: 25 }]}>
                          {item?.activity?.activityName}
                        </Text>
                        <View style={styles.horizontal}>
                          <Image
                            source={calendarIcon}
                            style={styles.iconStyle}
                          />
                          <Text style={styles.text}>{date}</Text>
                        </View>

                        <View style={styles.horizontal}>
                          <Image source={clockIcon} style={styles.iconStyle} />
                          <Text style={styles.text}>{`${moment().format(
                            "hh:mm a"
                          )}`}</Text>
                        </View>

                        <View style={styles.horizontal}>
                          <Image source={marker} style={styles.iconStyle} />
                          <Text style={styles.text}>{item?.venueFromName}</Text>
                        </View>

                        <View style={styles.horizontal}>
                          <Image source={marker} style={styles.iconStyle} />
                          <Text style={styles.text}>
                            {item?.venueFromAddress}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            ChangeModalState.action({
                              instructionsModalVisibility: true,
                            })
                          );
                          setSelectedInstructions(item);
                        }}
                        style={[styles.footer]}
                      >
                        <Text
                          style={[styles.text, { textAlign: "center" }]}
                        >{`Instructions / Disclaimer / Agreement`}</Text>
                      </TouchableOpacity>
                      </View> */}

                    <TouchableOpacity
                      onPress={() => {
                        // navigation.navigate('InstructorGroupApproval')
                      }}
                      style={[styles.item]}
                    >
                      <Text style={[styles.text, { fontSize: 25 }]}>
                        {`${item?.activity?.activityName}`}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={instructorImage} style={styles.iconImages} />
                        <Text>{item?.firstName + ' ' + item?.lastName}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Image
                          source={require('@/Assets/Images/circle-dashed.png')}
                          style={{
                            height: 40,
                            width: 15,
                            resizeMode: 'contain',
                            marginRight: 10,
                          }}
                        />
                        <View>
                          <Text style={styles.text}>{`${moment(
                            item?.activity?.fromDate == 'string'
                              ? new Date()
                              : item?.activity?.fromDate
                          ).format('MMM DD YYYY')} at ${moment
                            .utc(
                              item?.activity?.fromDate == 'string'
                                ? new Date()
                                : item?.activity?.fromDate
                            )
                            .format('hh:mm a')} `}</Text>
                          <Text style={styles.text}>{`${moment(
                            item?.activity?.toDate == 'string' ? new Date() : item?.activity?.toDate
                          ).format('MMM DD YYYY')} at ${moment
                            .utc(
                              item?.activity?.toDate == 'string'
                                ? new Date()
                                : item?.activity?.toDate
                            )
                            .format('hh:mm a')} `}</Text>
                        </View>
                      </View>

                      <View style={styles.horizontal}>
                        <Image source={marker} style={styles.iconStyle} />
                        <Text style={styles.text}>{item?.activity?.venueFromName}</Text>
                      </View>

                      <View style={styles.horizontal}>
                        <Image source={marker} style={styles.iconStyle} />
                        <View>
                          <Text style={styles.text}>
                            {`${item?.activity?.venueFromAddress}, ${item?.activity?.venueFromCity}, ${item?.activity?.venueFromState} ${item?.activity?.venueFromZip}, ${item?.activity?.venueFromCountry}`}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        dispatch(
                          ChangeModalState.action({
                            instructionsModalVisibility: true,
                          })
                        );
                        setSelectedInstructions(item);
                      }}
                      style={[styles.footer]}
                    >
                      <Text
                        style={[styles.text, { textAlign: 'center' }]}
                      >{`Instructions / Disclaimer / Agreement`}</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            ChangeModalState.action({
                              instructionsModalVisibility: true,
                            })
                          );
                          setSelectedInstructions(item);
                        }}
                        style={[styles.footer]}
                      >
                        <Text
                          style={[styles.text, { textAlign: "center" }]}
                        >{`Instructions / Disclaimer / Agreement`}</Text>
                      </TouchableOpacity> */}

                    {/* <View style={styles.horizontal}>
                        <Image source={email} style={styles.iconStyle} />

                        <Text
                          style={styles.text}
                        >{`${item?.parentEmail1}`}</Text>
                      </View>
                    </View>
                  </Swipeable>
                );
              } else {
                return (
                  <Swipeable
                    ref={(ref) => (row[item?.groupId] = ref)}
                    renderRightActions={(e) => RightActions(e, item)}
                    onSwipeableOpen={() => closeRow(item?.groupId)}
                  >
                    <View style={[styles.item]}>
                      <Text style={[styles.text, { fontSize: 25 }]}>
                        {item?.group?.groupName}
                      </Text>
                      <View style={styles.horizontal}>
                        <Image
                          source={instructorImage}
                          style={styles.iconStyle}
                        />
                        <Text
                          style={styles.text}
                        >{` ${item?.firstName} ${item?.lastName}`}</Text>
                      </View>
                      <View style={styles.horizontal}>
                        <Image source={calendarIcon} style={styles.iconStyle} />
                        <Text style={styles.text}>{`${moment(
                          item?.activity?.scheduler?.fromDate
                        ).format("YYYY-MM-DD")}`}</Text>
                      </View>

                      {/* <View style={styles.horizontal}>
                        <Image source={email} style={styles.iconStyle} />
                        <Text
                          style={styles.text}
                        >{`Parent Email 1: ${item?.parentEmail1}`}</Text>
                      </View> */}
                  </Swipeable>
                );
              } else {
                return (
                  <Swipeable
                    ref={(ref) => (row[item?.groupId] = ref)}
                    renderRightActions={(e) => RightActions(e, item)}
                    onSwipeableOpen={() => closeRow(item?.groupId)}
                  >
                    <View style={[styles.item]}>
                      <Text style={[styles.text, { fontSize: 25 }]}>{item?.group?.groupName}</Text>
                      <View style={styles.horizontal}>
                        <Image source={instructorImage} style={styles.iconStyle} />
                        <Text style={styles.text}>{` ${item?.firstName} ${item?.lastName}`}</Text>
                      </View>
                      {/* <View style={styles.horizontal}> */}
                      {/* <Image source={calendarIcon} style={styles.iconStyle} />
                        <Text style={styles.text}>{`${moment(
                          item?.
                        ).format('YYYY-MM-DD')}`}</Text>
                      </View> */}
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            ChangeModalState.action({
                              instructionsModalVisibility: true,
                            })
                          );
                          setSelectedGroup(item?.group);
                          setSelectedInstructions(item);
                        }}
                        style={[styles.footer]}
                      >
                        <Text
                          style={[styles.text, { textAlign: 'center' }]}
                        >{`Instructions / Disclaimer / Agreement`}</Text>
                      </TouchableOpacity>

                      {/* <View style={styles.horizontal}>
                      <Image source={email} style={styles.iconStyle} />
                      <Text
                        style={styles.text}
                      >{`Parent Email 1: ${item?.parentEmail1}`}</Text>
                    </View> */}
                    </View>
                  </Swipeable>
                );
              }
            }}
            onEndReached={async () => {
              if (totalRecordsActivity > activities.length) {
                getActivities(true);

                if (totalRecordsGroup > groups.length) {
                  getGroups(true);
                }
              }
            }}
            refreshing={false}
            onRefresh={() => null}
          />
          {refreshing && <ActivityIndicator size="large" color={Colors.primary} />}
        </View>
      </View>
    </>
  );
};

export default ParentApprovalScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: '2%',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  footer: {
    borderTopWidth: 0.3,
    borderTopColor: Colors.lightgray,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginHorizontal: '2%',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconImages: {
    height: 14,
    width: 14,
    resizeMode: 'contain',

    marginRight: 8,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
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
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  buttonSettings: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  iconStyle: {
    height: 25,
    width: 15,
    marginRight: 10,
    resizeMode: 'contain',
    tintColor: Colors.secondary,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
