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
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import { DeclineToGift } from "@/Services/GiftService";
import Colors from "@/Theme/Colors";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { GetOptIn } from "@/Services/Activity";
import { GetOptInGroup } from "@/Services/Group";
const InstructionsModal = ({
  selectedInstructions,
  setSelectedInstructions,
  activity,
  group,
}: {
  selectedInstructions: any;
  setSelectedInstructions: any;
  activity: any;
  group: any;
}) => {
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
  const [infomation, setInformation] = useState({});
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
    (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setPayment(false);
    setIsValid(false);
    setSelectedAmountIndex(null);
    if (isVisible) {
      if (group) {
        getGroupsOptInDetail();
      } else if (activity) getActivityOptInDetail();
    }
  }, [isVisible]);
  const getActivityOptInDetail = async () => {
    try {
      console.log("activity99", activity?.activityId);
      let res = await GetOptIn(activity?.activityId);

      setInformation({ ...infomation, ...res });
    } catch (err) {
      console.log("err", err);
    }
  };

  const getGroupsOptInDetail = async () => {
    try {
      console.log("group------990909090099090", group);
      let res = await GetOptInGroup(group?.groupId || group?.id);
      setInformation({ ...infomation, ...res });
    } catch (err) {
      console.log("err", err);
    }
  };

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ instructionsModalVisibility: false })
        );
        setSelectedInstructions(null);
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
              Instructions / Disclaimer / Agreement
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "600", fontSize: 16 }}>Instructions</Text>
          <ScrollView
            style={{
              padding: 5,
              borderWidth: 1,
              borderColor: Colors.primary,
              marginTop: 10,
              minHeight: 100,
            }}
          >
            <Text style={{ fontSize: 15 }}>{infomation?.instructions}</Text>
          </ScrollView>
          <Text style={{ fontWeight: "600", fontSize: 16, marginTop: 20 }}>
            Disclaimer
          </Text>
          <ScrollView
            style={{
              padding: 5,
              borderWidth: 1,
              borderColor: Colors.primary,
              marginTop: 10,
              minHeight: 100,
            }}
          >
            <Text style={{ fontSize: 15 }}>{infomation?.disclaimer}</Text>
          </ScrollView>
          <Text style={{ fontWeight: "600", fontSize: 16, marginTop: 20 }}>
            Agreement
          </Text>
          <ScrollView
            style={{
              padding: 5,
              borderWidth: 1,
              borderColor: Colors.primary,
              marginTop: 10,
              minHeight: 100,
            }}
          >
            <Text style={{ fontSize: 15 }}>{infomation?.agreement}</Text>
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
                ChangeModalState.action({ instructionsModalVisibility: false })
              );
              setSelectedInstructions(null);
            }}
          >
            Cancel
          </LinearGradientButton>
        </View>
      </Card>
    </Modal>
  );
};
export default InstructionsModal;

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
