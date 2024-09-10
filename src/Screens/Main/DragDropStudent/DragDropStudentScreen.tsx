import React, { FC, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DraxList, DraxProvider, DraxView } from 'react-native-drax';
import { AppHeader, LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { FindAllBus, GetBusByID, SaveStudentSeats } from '@/Services/BusConfiguration';
import { UserState } from '@/Store/User';
import { FindAllStudentsWhichActivity } from '@/Services/Activity';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

const gestureRootViewStyle = { flex: 1 };

type DragDropStudentScreenProps = {
  route: RouteProp<MainStackNavigatorParamsList, 'DragDropStudent'>;
};

const DragDropStudentScreen: FC<DragDropStudentScreenProps> = ({ route }) => {
  // const FirstReceivingItemList = [
  //   {
  //     id: 13,
  //     name: 'M',
  //     background_color: '#ffaaff',
  //   },
  //   {
  //     id: 14,
  //     name: 'N',
  //     background_color: '#ffaaff',
  //   },
  //   {
  //     id: 15,
  //     name: 'O',
  //     background_color: '#ffaaff',
  //   },
  //   {
  //     id: 16,
  //     name: 'P',
  //     background_color: '#ffaaff',
  //   },
  // ];

  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  // const [{ selectedActivity }] = useStateValue();
  // const [students, setStudents] = useState([{ name: 'jj' }]);
  //   const [students, setStudents] = React.useState(
  //     selectedActivity?.studentsActivity?.map((item) => ({
  //       id: item?.studentActivityId,
  //       name: item?.studentActivityId,
  //       background_color: "#fff",
  //     })) || []
  //   );
  // const [seatsAllocate, setSeatsAllocate] = useState([]);
  // const [allocated, setAllocated] = useState([]);
  const [bus, setBus] = useState<any>({
    busId: 3128,
    busName: 'strings',
    numberOfRows: 6,
    numberOfSeatsPerRow: 2,
    numberOfKidsPerSeat: 2,
    longSeat: true,
    numberOfKidsOnLongSeat: 5,
    activityId: null,
    instructorId: 1268,
    busSeatsReserved: [],
  });
  const [thumbnail, setThumbnail] = useState<boolean>(true);
  const [receivingItemList, setReceivedItemList] = useState<any[]>([]);
  const [dragItemMiddleList, setDragItemListMiddle] = useState<any[]>([
    // { name: "mm", background_color: "#fff", id: 1 },
    // { name: "nm", background_color: "#fff", id: 2 },
  ]);
  const [originaldragItemMiddleList, setOriginalDragItemListMiddle] = useState<any[]>([]);
  const currentUser = useSelector((state: { user: UserState }) => state.user.item);

  const [rearSeats, setRearSeats] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);

  const getBusbyId = async (bus: any, busDetail: any) => {
    try {
      let res = await GetBusByID(route?.params?.bus?.busId || route?.params?.bus);

      if (res.data.length > 0) {
        getSeatsList(res.data, busDetail);
      }
      return res;
    } catch (err) {
      console.log('err', err);
    }
  };
  const getBuses = async () => {
    // currentUser?.instructorId
    setLoading(true);
    FindAllBus(currentUser?.instructorId, 0, 100)
      .then(async (res) => {
        // console.log("88989389398938", res?.data);
        // setBus(
        //   {
        //     busId: 3128,
        //     busName: "strings",
        //     numberOfRows: 6,
        //     numberOfSeatsPerRow: 4,
        //     numberOfKidsPerSeat: 2,
        //     longSeat: true,
        //     numberOfKidsOnLongSeat: 5,
        //     activityId: null,
        //     instructorId: 1268,
        //     busSeatsReserved: [],
        //   }
        // res?.data?.result[0];

        const bus = res?.data?.result?.find((b: any) => b?.busId === route?.params.bus?.busId);
        setBus(bus);
        // let response = await getBusbyId(res, bus);
        setLoading(false);
      })
      .catch((err) => {
        console.log('getBuses Error:', err);
      });
  };
  const getSeatsList = (seats: any[], busInfo: any) => {
    try {
      const rearSeats = [];
      // let seats = [
      //   [1, null, null, null, null],
      //   [null, null, null, null],
      //   [null, 2, null, null],
      //   [null, null, null, null],
      //   [null, null, null, null],
      //   [null, null, null, null],
      //   [null, null, null, null],
      // ];
      let obj: any = {};
      seats.map((item) => {
        obj[`${item[1]}_${item[2]}`] = item;
      });

      let data = [];
      const temp = [];
      let users = [...dragItemMiddleList];

      let longSeat = false;

      if (busInfo.longSeat) {
        for (let j = 0; j < busInfo?.numberOfKidsOnLongSeat; j++) {
          let lgValue = JSON.stringify(busInfo?.numberOfRows + 1) + '_' + JSON.stringify(j + 1);
          if (obj[lgValue]) {
            let personObj = dragItemMiddleList.find((person) => person.id == obj[lgValue][0]);

            users = users.filter((per) => per.id != obj[lgValue][0]);

            rearSeats.push({
              id: personObj?.id,
              name: personObj?.name,
              background_color: personObj?.background_color,
            });
          } else {
            rearSeats.push({
              id: parseInt(`${j}` + 1, 0),
              name: '-',
              background_color: '#fff',
            });
          }
        }
      }

      for (let i = 0; i < busInfo?.numberOfRows; i++) {
        // let item = seats[i];
        let comparisonValue = longSeat
          ? busInfo?.numberOfKidsOnLongSeat
          : busInfo?.numberOfSeatsPerRow;
        for (let j = 0; j < comparisonValue; j++) {
          let k = JSON.stringify(i + 1) + '_' + JSON.stringify(j + 1);

          if (obj[k]) {
            let personObj = dragItemMiddleList.find((person) => person.id == obj[k][0]);

            users = users.filter((per) => per.id != obj[k][0]);

            data.push({
              id: personObj?.id,
              name: personObj?.name,
              background_color: personObj?.background_color,
            });
          } else {
            data.push({
              id: parseInt(`${i}` + 1, 0),
              name: '-',
              background_color: '#fff',
            });
          }
        }
        if (!longSeat) {
          temp.push(data);
          data = [];
        }

        longSeat = false;
      }

      let temp1 = seats.map((item, index) => ({
        name: '-',
        background_color: '#fff',
        id: index,
      }));
      setDragItemListMiddle([...users, ...temp1]);
      setRearSeats(rearSeats);
      setReceivedItemList(temp);
      // if (longSeat) {
      //   for (let i = 0; i<se; i++) {
      //     data.push({
      //       id: parseInt(`${i}` + 1, 0),
      //       name: "-",
      //       background_color: "#fff",
      //     });
      //   }
      //   setRearSeats(data);
      // }
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    if (isFocused) {
      if (route?.params?.students) {
        if (route.params?.attendanceMark) {
          const temp = route?.params?.students.map((item: any) => ({
            name: item?.firstName || item?.firstname,
            background_color: '#fff',
            id: item?.id || item?.studentId,
          }));

          setDragItemListMiddle(temp);
          setOriginalDragItemListMiddle(temp);
        } else {
          const temp = route?.params?.students.map((item: any) => ({
            name: item?.firstName || item?.firstname + item?.lastName || item?.lastname,
            background_color: '#fff',
            id: item?.studentId || item?.id,
          }));

          setDragItemListMiddle(temp);
          setOriginalDragItemListMiddle(temp);
        }
      } else {
        getApprovedStudents();
      }
    }
  }, [isFocused]);
  useEffect(() => {
    if (originaldragItemMiddleList.length > 0) {
      getBuses();
    }
  }, [originaldragItemMiddleList]);

  const DragUIComponent = ({ item, index }: { item: any; index: number }) => {
    return (
      <DraxView
        style={[
          styles.centeredContent,
          styles.draggableBox,
          { backgroundColor: item.background_color },
        ]}
        draggingStyle={styles.dragging}
        dragReleasedStyle={styles.dragging}
        hoverDraggingStyle={styles.hoverDragging}
        dragPayload={index}
        longPressDelay={150}
        key={index}
      >
        <Text style={styles.textStyle}>{item.name}</Text>
      </DraxView>
    );
  };
  const getApprovedStudents = async () => {
    let body = {
      activityId: route?.params?.activity?.activityId,
      status: 'approved',
      page: 0,
      page_size: 1000,
    };

    // console.log("body", body);
    FindAllStudentsWhichActivity(body)
      .then((res) => {
        const temp = res.map((item: any) => ({
          name: item?.firstName + item?.lastName,
          background_color: '#fff',
          id: item.studentId,
        }));
        setDragItemListMiddle(temp);
        setOriginalDragItemListMiddle(temp);
        // setStudents(res);
      })
      .catch((err) => {
        console.log('err99099009990', err);
      });
  };
  const ReceivingZoneUIComponent = ({
    item,
    index,
    parentIndex,
    isRear = false,
  }: {
    item: any;
    index: number;
    parentIndex: number;
    isRear?: boolean;
  }) => {
    // console.log("item", item);
    return (
      <DraxView
        style={[
          styles.centeredContent,
          styles.receivingZone,
          { backgroundColor: item.background_color },
        ]}
        receivingStyle={styles.receiving}
        renderContent={({ viewState }) => {
          const receivingDrag = viewState && viewState.receivingDrag;
          const payload = receivingDrag && receivingDrag.payload;
          return (
            <View>
              <Text style={styles.textStyle}>{item.name}</Text>
            </View>
          );
        }}
        key={index}
        onReceiveDragDrop={(event) => {
          let selected_item = dragItemMiddleList[event.dragged.payload];

          let newReceivingItemList = [...receivingItemList];
          if (isRear) {
            let newRearSeats = [...rearSeats];

            newRearSeats[index] = selected_item;
            setRearSeats(newRearSeats);
          } else {
            if (parentIndex >= 0) {
              newReceivingItemList[parentIndex][index] = selected_item;
            } else {
              newReceivingItemList[index] = selected_item;
            }
          }

          let newDragItemMiddleList = [...dragItemMiddleList];

          if (parentIndex >= 0) {
            // Alert.alert("akk");

            newDragItemMiddleList[event.dragged.payload] =
              selected_item.name != '-'
                ? {
                    id: 0,
                    name: '-',
                    background_color: '#fff',
                  }
                : originaldragItemMiddleList[event.dragged.payload];
            // receivingItemList[parentIndex][index];
            // console.log("prnet", receivingItemList[parentIndex][index]);
            // console.log("recievinglist", receivingItemList);
            setReceivedItemList(newReceivingItemList);
            // console.log("items", event.dragged.payload);
            // console.log("index", index);
            // console.log("parentindex", parentIndex);
          } else {
            newDragItemMiddleList[event.dragged.payload] = rearSeats[index];
          }
          // newDragItemMiddleList[event.dragged.payload] =
          //   receivingItemList[index];
          // console.log(
          //   "onReceiveDragDrop :: newDragItemMiddleList 2",
          //   newDragItemMiddleList
          // );
          setDragItemListMiddle(newDragItemMiddleList);
        }}
      />
    );
  };

  const FlatListItemSeparator = () => {
    return <View style={styles.itemSeparator} />;
  };

  const getSeats = () => {
    const data = [];
    for (let i = 0; i < bus?.numberOfRows; i++) {
      const innerData = [];

      for (let j = 0; j < bus?.numberOfKidsPerSeat * bus?.numberOfSeatsPerRow; j++) {
        innerData.push({
          id: parseInt(`${i}${j}` + 1, 0),
          name: '-',
          background_color: '#fff',
        });
      }
      data.push(innerData);
    }

    setSeats(data);
    setReceivedItemList(data);
  };

  const getRearSeats = () => {
    const data = [];
    for (let i = 0; i < bus?.numberOfKidsOnLongSeat; i++) {
      data.push({
        id: parseInt(`${i}` + 1, 0),
        name: '-',
        background_color: '#fff',
      });
    }
    setRearSeats(data);
  };

  // useEffect(() => {
  //   if (bus) {
  //     setLoading(true)
  //     getSeats();
  //     getRearSeats();
  //   }
  // }, [bus]);

  // console.log("acitivtyId", route.params.activity);
  const allocateSeats = async () => {
    try {
      let temp = [];
      let innerArr = [];
      let rearSeatsArr = [];
      for (let i = 0; i < receivingItemList.length; i++) {
        let item = receivingItemList[i];
        innerArr = [];
        for (let j = 0; j < item.length; j++) {
          item[j]?.name != '-' ? temp.push([item[j]?.id, i + 1, j + 1]) : null;
          // console.log("77887877", item[j]);
        }
        // temp.push(innerArr);
      }
      if (rearSeats.length > 0) {
        let rearArr = rearSeats.map((item, index) => {
          item?.name != '-'
            ? temp.push([item?.id, receivingItemList?.length + 1, index + 1])
            : null;
          // rearSeatsArr.push(item?.name == "-" ? null : item.id);
        });
        // temp=[...temp,...rearSeatsArr]
      }

      let res = await SaveStudentSeats(route?.params?.bus?.busId || route?.params?.bus, temp);

      // getSeats();
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <BackgroundLayout>
      <GestureHandlerRootView style={gestureRootViewStyle}>
        <AppHeader hideCenterIcon={true} hideCalendar={true} />
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={'large'} color={Colors.primary} />
          </View>
        ) : (
          <ScrollView>
            <View
              style={{
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                marginTop: 10,
              }}
            >
              <Switch
                style={{ marginLeft: 20 }}
                trackColor={{ false: '#767577', true: '#50CBC7' }}
                thumbColor={Colors.white}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setThumbnail(!thumbnail);
                  navigation.goBack();
                  dispatch(ChangeModalState.action({ rollCallModalVisibility: true }));
                }}
                value={thumbnail}
              />
            </View>
            <View>
              <Text style={styles.headerStyle}>{'Drag drop students on seats'}</Text>
            </View>
            <DraxProvider>
              <View style={styles.container}>
                <View style={styles.draxListContainer}>
                  <DraxList
                    data={dragItemMiddleList}
                    renderItemContent={DragUIComponent}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    scrollEnabled={true}
                  />
                </View>
                <View style={[styles?.receivingContainer, { marginTop: 10 }]}>
                  {/* {console.log("rearSeats", rearSeats)} */}
                  {rearSeats &&
                    rearSeats?.map((item, index) =>
                      ReceivingZoneUIComponent({
                        item,
                        index,
                        isRear: true,
                        parentIndex: -1,
                      })
                    )}
                </View>
                <View style={styles.receivingContainer}>
                  {/* {console.log(
                "receivingItemList",
                receivingItemList,
                FirstReceivingItemList
              )} */}
                  {/* {receivingItemList.map((item, index) =>
              ReceivingZoneUIComponent({ item, index })
            )} */}
                  {/* {console.log("receivingItemList", receivingItemList?.length)} */}
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {receivingItemList &&
                      receivingItemList?.map((i, parentIndex: number) => (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-evenly',
                            width: '100%',
                          }}
                        >
                          {i &&
                            i?.map((item: any, index: number) =>
                              ReceivingZoneUIComponent({
                                item,
                                index,
                                parentIndex,
                              })
                            )}
                        </View>
                      ))}
                  </View>
                </View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  Bus Front
                </Text>
              </View>
            </DraxProvider>
            <View style={{ width: '80%', alignSelf: 'center' }}>
              <LinearGradientButton
                onPress={() => {
                  allocateSeats();
                  // getSeatsList();
                }}
              >
                Save
              </LinearGradientButton>
            </View>
            <View style={{ marginBottom: 80 }} />
          </ScrollView>
        )}
      </GestureHandlerRootView>
    </BackgroundLayout>
  );
};

export default DragDropStudentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    // justifyContent: "space-between",
    // flexDirection: "row",
  },
  centeredContent: {
    borderRadius: 10,
    margin: 3,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButton: {
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
    marginBottom: 5,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  receivingZone: {
    height: 40,
    borderRadius: 10,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  receiving: {
    borderColor: 'red',
    borderWidth: 2,
  },
  draggableBox: {
    width: 60,
    padding: 5,
    // height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
    marginVertical: 2,
  },
  dragging: {
    opacity: 0.2,
  },
  hoverDragging: {
    borderColor: 'magenta',
    borderWidth: 2,
  },
  receivingContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  itemSeparator: {
    height: 15,
  },
  draxListContainer: {
    padding: 5,
    // height: "100%",
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  receivingZoneContainer: {
    padding: 5,
    height: 100,
  },
  textStyle: {
    fontSize: 18,
  },
  headerStyle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
});
