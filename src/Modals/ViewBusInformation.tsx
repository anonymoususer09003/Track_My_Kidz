import React, { useEffect, useState } from "react";
import {
  Text,
  Input,
  TopNavigationAction,
  Icon,
  CheckBox,
} from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import { CreateBus, PutBus } from "@/Services/BusConfiguration";
import { UserState } from "@/Store/User";
import FetchOne from "@/Services/User/FetchOne";
import { useNavigation } from "@react-navigation/native";
const ViewBusInformation = ({
  isLongSeat,
  numberOfKidsLongSeat,
  numberOfRows,
  numberOfKidsInRow,
  numberOfSeatsPerRow,
  busName,
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
  const deviceWidth = Dimensions.get("screen").width;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [rearSeats, setRearSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  console.log("currentUser00000000000000000000000", numberOfKidsLongSeat);
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
    (state: { modal: ModalState }) => state.modal.viewBusInformationModal
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
            viewBusInformationModal: false,
          })
        );
      }}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({
            viewBusInformationModal: false,
          })
        );
      }}
      onBackButtonPress={() => {
        dispatch(
          ChangeModalState.action({
            viewBusInformationModal: false,
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
            <ScrollView style={{ flex: 1 }}>
              <View horizontal style={{ flex: 1, paddingBottom: 5 }}>
                <View
                  style={{
                    width: "100%",
                    alignSelf: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {isLongSeat &&
                    rearSeats.map((item) => (
                      <View
                        style={{
                          flexDirection: "row",
                          // alignItems: "center",
                          // justifyContent: "space-between",
                          // marginRight: 10,
                        }}
                      >
                        <View
                          style={{
                            margin: 5,
                            height: 40,
                            width: "12%",
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: "#000",
                            padding: 20,
                            backgroundColor: Colors.textInputBackgroundColor,
                          }}
                        />
                      </View>
                    ))}
                </View>
              </View>

              <View horizontal style={{ flex: 1, paddingBottom: 5 }}>
                <View style={{ width: "100%" }}>
                  {seats.map((item, index) => {
                    let width = "10%";
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {item &&
                          item?.length > 0 &&
                          item.map((innerItem, index) => (
                            <View
                              style={{
                                borderWidth: 1,
                                margin: 3,
                                width: width,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor:
                                  Colors.textInputBackgroundColor,
                              }}
                            ></View>
                          ))}
                      </View>
                    );
                  })}
                </View>
              </View>

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
              <View
                style={{
                  flexDirection: "column",
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View style={styles.horizonatal}>
                  <Text style={styles.label}>Bus Name:</Text>
                  <Text style={styles.textLabel}>{busName}</Text>
                </View>
                <View style={styles.horizonatal}>
                  <Text style={styles.label}>Number of Rows:</Text>
                  <Text style={styles.textLabel}>{numberOfRows}</Text>
                </View>
                <View style={styles.horizonatal}>
                  <Text style={styles.label}>Number of seats per row:</Text>
                  <Text style={styles.textLabel}>{numberOfSeatsPerRow}</Text>
                </View>
                <View style={styles.horizonatal}>
                  <Text style={styles.label}>Number of Kids per seat:</Text>
                  <Text style={styles.textLabel}>{numberOfKidsInRow}</Text>
                </View>
                <View style={styles.horizonatal}>
                  <Text style={{ marginRight: 10, fontWeight: "bold" }}>
                    Do you have a rear long seats?
                  </Text>
                  <CheckBox
                    style={{ marginRight: 20 }}
                    checked={isLongSeat}
                    onChange={() => null}
                  >
                    {""}
                  </CheckBox>
                </View>
                <View style={styles.horizonatal}>
                  <Text style={styles.label}>Number of kids long seat:</Text>
                  <Text style={styles.textLabel}>{numberOfKidsLongSeat}</Text>
                </View>
              </View>
              <View style={{ height: 70 }} />
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
                    dispatch(
                      ChangeModalState.action({
                        viewBusInformationModal: false,
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
export default ViewBusInformation;

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
  horizonatal: {
    flexDirection: "row",
  },
  textLabel: {
    marginLeft: 5,
  },
  label: {
    fontWeight: "bold",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
