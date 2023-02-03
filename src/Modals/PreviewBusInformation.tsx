import React, { useEffect, useState } from "react";
import { Text, Input, TopNavigationAction, Icon } from "@ui-kitten/components";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import { CreateBus, PutBus } from "@/Services/BusConfiguration";
import { UserState } from "@/Store/User";
import FetchOne from "@/Services/User/FetchOne";
import { useNavigation } from "@react-navigation/native";
const PreviewBusInformation = ({
  isLongSeat,
  numberOfKidsLongSeat,
  numberOfRows,
  numberOfKidsInRow,
  buses,
  setBuses,
  busName,
  numberOfSeatsPerRow,
  setBusName,
  setNumberOfRows,
  setNumberOfSeatsPerRow,
  setNumberOfKidsPerSeat,
  setIsLongSeat,
  setNumberOfKidsLongSeat,
  activity,
  selectedItem,
  fromActivity,
}: {
  isLongSeat: boolean;
  numberOfKidsLongSeat: number;
  numberOfRows: number;
  numberOfKidsInRow: number;
  buses?: Array<object>;
  setBuses?: Function;
  busName: string;
  numberOfSeatsPerRow: number;
  setBusName: Function;
  setNumberOfRows: Function;
  setNumberOfSeatsPerRow: Function;
  setNumberOfKidsPerSeat: Function;
  setIsLongSeat: Function;
  setNumberOfKidsLongSeat: Function;
  activity?: any;
  selectedItem: any;
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [rearSeats, setRearSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  // console.log("currentUser00000000000000000000000", currentUser);
  const getRearSeats = () => {
    const data = [];
    for (let i = 0; i < numberOfKidsLongSeat; i++) {
      data.push("");
    }
    setRearSeats(data);
  };

  const getSeats = () => {
    const data = [];
    console.log(numberOfKidsInRow, numberOfSeatsPerRow);
    const rowsInSeat = numberOfKidsInRow * numberOfSeatsPerRow;
    for (let i = 0; i < numberOfRows; i++) {
      const innerData = [];
      for (let j = 0; j < rowsInSeat; j++) {
        innerData.push("");
      }
      data.push(innerData);
    }
    console.log(data);
    setSeats(data);
  };

  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.previewButInformationModalVisibility
  );

  useEffect(() => {
    getSeats();
    getRearSeats();
  }, [isVisible]);

  // @ts-ignore
  return (
    <Modal
      propagateSwipe={true}
      coverScreen={true}
      isVisible={isVisible}
      style={{ margin: 0, marginTop: 50 }}
      swipeDirection="down"
      onSwipeComplete={() => {
        dispatch(
          ChangeModalState.action({
            previewButInformationModalVisibility: false,
          })
        );
      }}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({
            previewButInformationModalVisibility: false,
          })
        );
      }}
      onBackButtonPress={() => {
        dispatch(
          ChangeModalState.action({
            previewButInformationModalVisibility: false,
          })
        );
      }}
    >
      <>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <View style={styles.layout}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
              <ScrollView horizontal style={{ flex: 1, paddingBottom: 5 }}>
                <View
                  style={{
                    width: "80%",
                    alignSelf: "center",
                    flexDirection: "row",
                  }}
                >
                  {isLongSeat &&
                    rearSeats.map((item) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginRight: 10,
                        }}
                      >
                        <Input
                          style={{
                            margin: 5,
                            borderColor: "#000",
                            width: 60,
                          }}
                          autoCapitalize="none"
                          value={item}
                        />
                      </View>
                    ))}
                </View>
              </ScrollView>

              <ScrollView horizontal style={{ flex: 1, paddingBottom: 5 }}>
                <View style={{ width: "80%", alignSelf: "center" }}>
                  {seats.map((item) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {item &&
                        item?.length > 0 &&
                        item.map((innerItem) => (
                          <Input
                            style={{ margin: 5 }}
                            autoCapitalize="none"
                            value={innerItem}
                          />
                        ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
              <Text
                style={{
                  marginVertical: 10,
                  fontWeight: "bold",
                  fontSize: 24,
                  alignSelf: "center",
                }}
              >
                Front
              </Text>
            </ScrollView>
            <View
              style={{
                position: "absolute",
                bottom: 30,
                left: 0,
                right: 0,
                alignItems: "center",
                width: "100%",
              }}
            >
              <View style={styles.bottomButton}>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    console.log({
                      id: selectedItem.busId,
                      busName: busName,
                      numberOfRows: numberOfRows,
                      numberOfSeatsPerRow: numberOfSeatsPerRow,
                      numberOfKidsPerSeat: numberOfKidsInRow,
                      longSeat: isLongSeat,
                      studentsOnLongSeat: numberOfKidsLongSeat,
                      activityId: activity?.activityId || 0,
                      schoolId: currentUser?.schoolId || 0,
                      orgId: currentUser?.orgId || 0,
                      instructorId: currentUser?.instructorId || 0,
                    });
                    if (selectedItem) {
                      PutBus({
                        id: selectedItem.busId,
                        busName: busName,
                        numberOfRows: numberOfRows,
                        numberOfSeatsPerRow: numberOfSeatsPerRow,
                        numberOfKidsPerSeat: numberOfKidsInRow,
                        longSeat: isLongSeat,
                        studentsOnLongSeat: numberOfKidsLongSeat,
                        activityId: activity?.activityId || null,
                        schoolId: currentUser?.schoolId || null,
                        orgId: currentUser?.orgId || null,
                        instructorId: currentUser?.instructorId || null,
                      })
                        .then((res) => {
                          console.log(res.data);
                          const data =
                            buses && buses?.length > 0 ? [...buses] : [];
                          let index = data.findIndex(
                            (item) => item?.busId == selectedItem?.busId
                          );
                          let temp = [...data];

                          temp[index] = res?.data;

                          // data.push(res?.data);
                          setBuses(temp);
                          setBusName("");
                          setNumberOfRows("");
                          setNumberOfSeatsPerRow("");
                          setNumberOfKidsPerSeat("");
                          setIsLongSeat(false);
                          setNumberOfKidsLongSeat("");

                          dispatch(
                            ChangeModalState.action({
                              previewButInformationModalVisibility: false,
                              addButInformationModalVisibility: false,
                            })
                          );
                        })
                        .catch((err) => {
                          console.log("err", err);
                        });
                    } else {
                      CreateBus({
                        busName: busName,
                        numberOfRows: numberOfRows,
                        numberOfSeatsPerRow: numberOfSeatsPerRow,
                        numberOfKidsPerSeat: numberOfKidsInRow,
                        longSeat: isLongSeat,
                        studentsOnLongSeat: numberOfKidsLongSeat,
                        activityId: activity?.activityId || null,
                        schoolId: currentUser?.schoolId || null,
                        orgId: currentUser?.orgId || null,
                        instructorId: currentUser?.instructorId || null,
                      })
                        .then((res) => {
                          console.log(res.data);
                          const data =
                            buses && buses?.length > 0 ? [...buses] : [];
                          data.push(res?.data);
                          setBuses(data);
                          setBusName("");
                          setNumberOfRows("");
                          setNumberOfSeatsPerRow("");
                          setNumberOfKidsPerSeat("");
                          setIsLongSeat(false);
                          setNumberOfKidsLongSeat("");

                          dispatch(
                            ChangeModalState.action({
                              previewButInformationModalVisibility: false,
                              addButInformationModalVisibility: false,
                            })
                          );
                        })
                        .catch((err) => {
                          setBusName("");
                          setNumberOfRows("");
                          setNumberOfSeatsPerRow("");
                          setNumberOfKidsPerSeat("");
                          setIsLongSeat(false);
                          setNumberOfKidsLongSeat("");

                          dispatch(
                            ChangeModalState.action({
                              previewButInformationModalVisibility: false,
                              addButInformationModalVisibility: false,
                            })
                          );
                          console.log("err", err);
                        });
                    }
                  }}
                >
                  <Text style={styles.button}>I'm done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bottomButton}>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    console.log(activity);
                    if (selectedItem) {
                      PutBus({
                        id: selectedItem.busId,
                        busName: busName,
                        numberOfRows: numberOfRows,
                        numberOfSeatsPerRow: numberOfSeatsPerRow,
                        numberOfKidsPerSeat: numberOfKidsInRow,
                        longSeat: isLongSeat,
                        studentsOnLongSeat: numberOfKidsLongSeat,
                        activityId: activity?.activityId || null,
                        schoolId: currentUser?.schoolId || null,
                        orgId: currentUser?.orgId || null,
                        instructorId: currentUser?.instructorId || null,
                      })
                        .then((res) => {
                          console.log(res.data);
                          const data =
                            buses && buses?.length > 0 ? [...buses] : [];
                          let index = data.findIndex(
                            (item) => item?.busId == selectedItem?.busId
                          );
                          let temp = [...data];

                          temp[index] = res?.data;

                          // data.push(res?.data);
                          setBuses(temp);
                          setBusName("");
                          setNumberOfRows("");
                          setNumberOfSeatsPerRow("");
                          setNumberOfKidsPerSeat("");
                          setIsLongSeat(false);
                          setNumberOfKidsLongSeat("");

                          dispatch(
                            ChangeModalState.action({
                              previewButInformationModalVisibility: false,
                              addButInformationModalVisibility: false,
                            })
                          );
                        })
                        .catch((err) => {
                          console.log("err", err);
                        });
                    } else {
                      CreateBus({
                        busName: busName,
                        numberOfRows: numberOfRows,
                        numberOfSeatsPerRow: numberOfSeatsPerRow,
                        numberOfKidsPerSeat: numberOfKidsInRow,
                        longSeat: isLongSeat,
                        studentsOnLongSeat: numberOfKidsLongSeat,
                        activityId: activity?.activityId || 0,
                        schoolId: currentUser?.schoolId || 0,
                        orgId: currentUser?.orgId || 0,
                        instructorId: currentUser?.instructorId || 0,
                      })
                        .then((res) => {
                          console.log(res.data);
                          // console.log("data", data);
                          console.log("buses", buses);
                          const data =
                            buses && buses?.length > 0 ? [...buses] : [];
                          console.log("data", data);
                          // console.log("data",data)
                          // console.log("buses",buses)
                          data.push(res?.data);
                          if (fromActivity) {
                            navigation.navigate("DragDropStudent", {
                              bus: data?.busId,
                              activity: activity,
                            });
                            dispatch(
                              ChangeModalState.action({
                                setupVehicleModal: false,
                              })
                            );
                          }
                          setBuses(data);
                          setBusName("");
                          setNumberOfRows("");
                          setNumberOfSeatsPerRow("");
                          setNumberOfKidsPerSeat("");
                          setIsLongSeat(false);
                          setNumberOfKidsLongSeat("");

                          dispatch(
                            ChangeModalState.action({
                              previewButInformationModalVisibility: false,
                            })
                          );
                        })
                        .catch((err) => {
                          console.log("err", err);
                        });
                    }
                  }}
                >
                  <Text style={styles.button}>Save and add another Bus</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bottomButton}>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    dispatch(
                      ChangeModalState.action({
                        previewButInformationModalVisibility: false,
                      })
                    );
                  }}
                >
                  <Text style={styles.button}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </>
    </Modal>
  );
};
export default PreviewBusInformation;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
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
    flexDirection: "column",
    paddingTop: 20,
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    paddingHorizontal: 10,
    paddingTop: 10,
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
    justifyContent: "space-between",
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  bottomButton: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
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
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
