import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  CheckBox,
  Input,
  TopNavigationAction,
  Icon,
} from "@ui-kitten/components";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import PreviewBusInformation from "./PreviewBusInformation";

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
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
        <>
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
              backgroundColor: Colors.white,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            <View style={styles.layout}>
              <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <View style={{ marginTop: 10 }}>
                  <Input
                    style={{ margin: 5 }}
                    autoCapitalize="none"
                    placeholder="Give your bus a name"
                    value={busName}
                    onChangeText={(val) => setBusName(val)}
                  />
                </View>
                <View style={{ marginTop: 10, maxHeight: 150 }}>
                  <View style={styles.row}>
                    <Text>Number of row</Text>
                    <Input
                      style={{ margin: 5 }}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      value={numberOfRows}
                      onChangeText={(val) => setNumberOfRows(val)}
                    />
                  </View>
                  <View style={styles.row}>
                    <View>
                      <Text>Number of seats per row</Text>
                      <Text style={{ color: "red", fontSize: 12 }}>
                        (add all seats of both sides of isle)
                      </Text>
                    </View>
                    <Input
                      style={{ margin: 5 }}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      value={numberOfSeatsPerRow}
                      onChangeText={(val) => setNumberOfSeatsPerRow(val)}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text>Number of kids per seat</Text>
                    <Input
                      style={{ margin: 5 }}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      value={numberOfKidsPerSeat}
                      onChangeText={(val) => setNumberOfKidsPerSeat(val)}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text>Do you have a rear long seat?</Text>
                    <CheckBox
                      style={{ marginRight: 20 }}
                      checked={isLongSeat}
                      onChange={() => setIsLongSeat(!isLongSeat)}
                    >
                      {""}
                    </CheckBox>
                  </View>
                  {isLongSeat && (
                    <View style={styles.row}>
                      <Text>Number of seats on long seat</Text>
                      <Input
                        style={{ margin: 5 }}
                        autoCapitalize="none"
                        keyboardType="number-pad"
                        value={numberOfKidsLongSeat}
                        onChangeText={(val) => setNumberOfKidsLongSeat(val)}
                      />
                    </View>
                  )}
                </View>
              </View>
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
                    onPress={() =>
                      dispatch(
                        ChangeModalState.action({
                          previewButInformationModalVisibility: true,
                        })
                      )
                    }
                  >
                    <Text style={styles.button}>Preview</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.bottomButton}>
                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => {
                      dispatch(
                        ChangeModalState.action({
                          addButInformationModalVisibility: false,
                        })
                      );
                    }}
                  >
                    <Text style={styles.button}>I'll do it later</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </>
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
