import {
  Card,
  IndexPath,
  Modal,
  RadioGroup,
  Text,
} from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import { DeclineToGift } from "@/Services/GiftService";
import Colors from "@/Theme/Colors";
import EvilIcons from "react-native-vector-icons/EvilIcons";

const ChildrenSelectionModal = ({
  setSelectedChild,
  activity,
  children,
}: {
  setSelectedChild: (item: any) => void;
  activity: any;
  children: any[];
}) => {
  const { Layout } = useTheme();
  const [selectedAmountIndex, setSelectedAmountIndex] =
    useState<IndexPath | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [payment, setPayment] = useState(false);
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.childrenSelectionModalVisibility
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setPayment(false);
    setIsValid(false);
    setSelectedAmountIndex(null);
  }, [isVisible]);
  console.log("acitivyt", activity);
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ childrenSelectionModalVisibility: false })
        );
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <View style={styles.body}>
          <View style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Text
              textBreakStrategy={"highQuality"}
              style={{
                textAlign: "center",
                color: "#606060",
                fontSize: 18,
              }}
            >
              Please select your children from the list
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <ScrollView style={{ padding: 5, marginTop: 10, minHeight: 100 }}>
            {children &&
              children.map((child) => (
                <TouchableOpacity
                  style={{ paddingVertical: 5 }}
                  onPress={() => {
                    dispatch(
                      ChangeModalState.action({
                        approveActivityModalVisibility: true,
                        childrenSelectionModalVisibility: false,
                      })
                    );
                    setSelectedChild(child);
                  }}
                >
                  <Text style={{ fontSize: 15 }}>
                    {child?.firstname + " " + child?.lastname}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
        <View style={styles.buttonText}>
          <LinearGradientButton
            style={{
              borderRadius: 25,
              flex: 1,
            }}
            appearance="ghost"
            size="medium"
            status="control"
            onPress={() => {
              // DeclineToGift().then()
              dispatch(
                ChangeModalState.action({
                  childrenSelectionModalVisibility: false,
                })
              );
            }}
          >
            Cancel
          </LinearGradientButton>
        </View>
      </Card>
    </Modal>
  );
};
export default ChildrenSelectionModal;

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
    flex: 1,
    flexDirection: "row",
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    height: 45,
    marginTop: 10,
    justifyContent: "space-between",
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 2,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: "center",
    backgroundColor: Colors.primary,
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
