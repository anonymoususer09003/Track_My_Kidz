import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  CheckBox,
  Input,
  TopNavigationAction,
  Icon,
} from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import PreviewBusInformation from "./PreviewBusInformation";
import { LinearGradientButton } from "@/Components";

const AddBusInformation = ({
  activity,
  buses,
  setBuses,
  selectedItem,
  fromActivity,
}: {
  activity?: any;
  buses?: Array<object>;
  setBuses?: Function;
  selectedItem: any;
  fromActivity: any;
}) => {
  console.log("selectedItem", selectedItem);
  const dispatch = useDispatch();
  const isVisiblePreview = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.previewButInformationModalVisibility
  );
  const [approvals, setApprovals] = useState([]);
  const [rollCall, setRollCall] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [busName, setBusName] = useState(selectedItem?.busName || "");

  const [numberOfRows, setNumberOfRows] = useState(
    selectedItem?.numberOfRows || ""
  );
  console.log("numb", numberOfRows);
  const [numberOfSeatsPerRow, setNumberOfSeatsPerRow] = useState(
    selectedItem?.numberOfSeatsPerRow || ""
  );

  console.log("numb per", numberOfSeatsPerRow);
  const [numberOfKidsPerSeat, setNumberOfKidsPerSeat] = useState(
    selectedItem?.numberOfKidsPerSeat || ""
  );
  const [isLongSeat, setIsLongSeat] = useState(selectedItem?.longSeat || false);
  const [numberOfKidsLongSeat, setNumberOfKidsLongSeat] = useState(
    selectedItem?.numberOfKidsOnLongSeat || ""
  );

  useEffect(() => {
    if (selectedItem && Object.keys(selectedItem).length > 0) {
      setBusName(selectedItem?.busName);
      setNumberOfRows(selectedItem?.numberOfRows?.toString());
      setNumberOfSeatsPerRow(selectedItem?.numberOfSeatsPerRow?.toString());
      setNumberOfKidsPerSeat(selectedItem?.numberOfKidsPerSeat?.toString());
      setIsLongSeat(selectedItem?.longSeat);
      setNumberOfKidsLongSeat(
        selectedItem?.longSeat
          ? selectedItem?.numberOfKidsOnLongSeat?.toString()
          : ""
      );
    }
  }, [selectedItem, isVisible]);

  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.addButInformationModalVisibility
  );
  useEffect(() => {
    if (!isVisible) {
      setNumberOfKidsLongSeat("");
      setIsLongSeat(false);
      setNumberOfKidsPerSeat("");
      setNumberOfRows("");
      setNumberOfSeatsPerRow("");
      setBusName("");
    }
  }, [isVisible]);
  let disabled =
    busName == "" ||
    numberOfSeatsPerRow == "" ||
    numberOfKidsPerSeat == "" ||
    numberOfRows == ""
      ? true
      : false;
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
          ChangeModalState.action({ addButInformationModalVisibility: false })
        );
      }}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ addButInformationModalVisibility: false })
        );
      }}
      onBackButtonPress={() => {
        dispatch(
          ChangeModalState.action({ addButInformationModalVisibility: false })
        );
      }}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flex: 1,
          backgroundColor: Colors.newBackgroundColor,
        }}
      >
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          {isVisiblePreview && (
            <PreviewBusInformation
              fromActivity={fromActivity}
              selectedItem={selectedItem ? selectedItem : false}
              buses={buses}
              setBuses={setBuses}
              numberOfRows={parseInt(numberOfRows)}
              numberOfKidsInRow={parseInt(numberOfKidsPerSeat, 0)}
              isLongSeat={isLongSeat}
              numberOfKidsLongSeat={parseInt(numberOfKidsLongSeat)}
              busName={busName}
              numberOfSeatsPerRow={parseInt(numberOfSeatsPerRow)}
              setBusName={setBusName}
              setNumberOfRows={setNumberOfRows}
              setNumberOfSeatsPerRow={setNumberOfSeatsPerRow}
              setNumberOfKidsPerSeat={setNumberOfKidsPerSeat}
              setIsLongSeat={setIsLongSeat}
              setNumberOfKidsLongSeat={setNumberOfKidsLongSeat}
              activity={activity}
            />
          )}
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.newBackgroundColor,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              overflow: "hidden",
            }}
          >
            <View style={styles.layout}>
              <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <View style={{ marginTop: 10 }}>
                  <Input
                    style={styles.textInput}
                    autoCapitalize="none"
                    placeholder="Give your bus a name"
                    value={busName}
                    onChangeText={(val) => setBusName(val)}
                    label={(evaProps: any) => (
                      <Text style={styles.inputLabels}>Bus Name</Text>
                    )}
                  />
                </View>
                <View style={{ marginTop: 10, maxHeight: 150 }}>
                  <View style={styles.row}>
                    <Input
                      style={styles.textInput}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      value={numberOfRows}
                      onChangeText={(val) => setNumberOfRows(val)}
                      label={(evaProps: any) => (
                        <Text style={styles.inputLabels}>Number of row</Text>
                      )}
                    />
                  </View>
                  <View style={styles.row}>
                    <Input
                      style={styles.textInput}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      value={numberOfSeatsPerRow}
                      onChangeText={(val) => setNumberOfSeatsPerRow(val)}
                      label={(evaProps: any) => (
                        <>
                          <Text
                            style={[styles.inputLabels, { marginBottom: 2 }]}
                          >
                            Number of seats per row
                          </Text>
                          <Text
                            style={{
                              color: "red",
                              fontSize: 12,
                              marginBottom: 10,
                            }}
                          >
                            (add all seats of both sides of isle)
                          </Text>
                        </>
                      )}
                    />
                  </View>
                  <View style={styles.row}>
                    <Input
                      style={styles.textInput}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      value={numberOfKidsPerSeat}
                      onChangeText={(val) => setNumberOfKidsPerSeat(val)}
                      label={(evaProps: any) => (
                        <Text style={styles.inputLabels}>
                          Number of kids per seat
                        </Text>
                      )}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.inputLabels, { marginLeft: 12 }]}>
                      Do you have a rear long seat?
                    </Text>
                    <CheckBox
                      style={{ marginRight: 2 }}
                      checked={isLongSeat}
                      onChange={() => setIsLongSeat(!isLongSeat)}
                    >
                      {""}
                    </CheckBox>
                  </View>
                  {isLongSeat && (
                    <View style={styles.row}>
                      <Input
                        style={styles.textInput}
                        autoCapitalize="none"
                        keyboardType="number-pad"
                        value={numberOfKidsLongSeat}
                        onChangeText={(val) => setNumberOfKidsLongSeat(val)}
                        label={(evaProps: any) => (
                          <Text style={styles.inputLabels}>
                            Number of seats on long seat
                          </Text>
                        )}
                      />
                    </View>
                  )}
                </View>
              </View>
              <View
                style={{
                  alignItems: "center",
                  width: "90%",
                  marginTop: 30,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              >
                <LinearGradientButton
                  disabled={disabled}
                  onPress={() =>
                    dispatch(
                      ChangeModalState.action({
                        previewButInformationModalVisibility: true,
                      })
                    )
                  }
                >
                  Preview
                </LinearGradientButton>

                <TouchableOpacity
                  onPress={() => {
                    dispatch(
                      ChangeModalState.action({
                        addButInformationModalVisibility: false,
                      })
                    );
                  }}
                  style={{ marginVertical: 10 }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: "center",
                      color: Colors.primaryTint,
                    }}
                  >
                    I'll do it later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default AddBusInformation;

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
  textInput: {
    marginTop: 10,
    alignSelf: "center",
    width: "95%",

    borderRadius: 8,
    elevation: 2,
    marginLeft: 13,
  },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 10,
  },
  topNav: {
    color: Colors.white,
  },
  layout: {
    flex: 1,
    flexDirection: "column",
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
