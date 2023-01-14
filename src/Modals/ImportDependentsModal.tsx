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
import { StyleSheet, View, TouchableOpacity } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import { DeclineToGift } from "@/Services/GiftService";
import Colors from "@/Theme/Colors";
import EvilIcons from "react-native-vector-icons/EvilIcons";

const dependents = [
  {
    id: 1,
    name: "Name one",
  },
  {
    id: 2,
    name: "Name two",
  },
  {
    id: 3,
    name: "Name three",
  },
];

const ImportDependentsModal = ({ children, removeChild, importChildrens }) => {
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const amountValues = [
    { id: 0, amount: 500, label: "$5" },
    { id: 1, amount: 1000, label: "$10" },
    {
      id: 3,
      amount: 2000,
      label: "$20",
    },
    { id: 4, amount: 5000, label: "$50" },
    { id: 5, amount: 10000, label: "$100" },
  ];

  const { Layout } = useTheme();
  const [selectedAmountIndex, setSelectedAmountIndex] =
    useState<IndexPath | null>(null);
  const [cardData, setCardData] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [payment, setPayment] = useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const availableAmounts = [
    {
      amount: 1,
      label: "$50 - Annually (Best Deal)",
    },
    {
      amount: 5,
      label: "$4.99 - Monthly",
    },
  ];
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.importDependentsModalVisibility
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setPayment(false);
    setIsValid(false);
    setSelectedAmountIndex(null);
  }, [isVisible]);

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ importDependentsModalVisibility: false })
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
              Import Dependents
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 30, padding: 20 }}>
          {children?.map((dependent) => (
            <View
              // onPress={() => {
              //   removeChild(dependent);
              // }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 5,
              }}
            >
              <Text>{dependent?.firstname + " " + dependent?.lastname}</Text>
              {/* <EvilIcons name="trash" color={Colors.primary} size={30} /> */}
            </View>
          ))}
        </View>
        <View
          style={[
            styles.buttonText,
            {
              backgroundColor:
                children.length > 0 ? Colors.primary : Colors.gray,
            },
          ]}
        >
          <LinearGradientButton
            style={{
              borderRadius: 25,
              flex: 1,
            }}
            disabled={children.length > 0 ? false : true}
            appearance="ghost"
            size="medium"
            status="control"
            onPress={() => {
              importChildrens();
              const amount = availableAmounts[selectedIndex];
              dispatch(
                ChangeSelectedState.action({
                  selectedAmount: amount.amount,
                })
              );
              dispatch(
                ChangeModalState.action({
                  importDependentsModalVisibility: false,
                })
              );
            }}
          >
            Continue
          </LinearGradientButton>
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
              DeclineToGift().then();
              dispatch(
                ChangeModalState.action({
                  importDependentsModalVisibility: false,
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
export default ImportDependentsModal;

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
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
