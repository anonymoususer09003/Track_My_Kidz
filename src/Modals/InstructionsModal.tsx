import { LinearGradientButton } from "@/Components";
import { GetOptIn } from "@/Services/Activity";
import { GetOptInGroup } from "@/Services/Group";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import Colors from "@/Theme/Colors";
import {
  Card,
  IndexPath,
  Modal,
  Text
} from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
const InstructionsModal = ({
  selectedInstructions,
  setSelectedInstructions,
  activity,
  group,
}: {
  selectedInstructions?: any;
  setSelectedInstructions?: any;
  activity?: any;
  group?: any;
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
  // const [cardData, setCardData] = useState<any>({});
  const [isValid, setIsValid] = useState<boolean>(false);
  const [payment, setPayment] = useState<boolean>(false);
  const [infomation, setInformation] = useState<any>({});
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
    console.log('isVisible',isVisible,activity)
    if (isVisible) {
      if (group) {
        getGroupsOptInDetail();
      } else if (activity) getActivityOptInDetail();
    }
  }, [isVisible, group, activity]);
  const getActivityOptInDetail = async () => {
    try {
      console.log("activity99", activity?.activityId);
      let res = await GetOptIn(activity?.activityId);
console.log('resssss',res)
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
          <Text style={styles.inputLabels}>Instructions</Text>
          <ScrollView style={styles.textArea}>
            <Text style={{ fontSize: 15 }}>{infomation?.instructions}</Text>
          </ScrollView>
          <Text style={styles.inputLabels}>Disclaimer</Text>
          <ScrollView style={styles.textArea}>
            <Text style={{ fontSize: 15 }}>{infomation?.disclaimer}</Text>
          </ScrollView>
          <Text style={styles.inputLabels}>Agreement</Text>
          <ScrollView style={styles.textArea}>
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
  textArea: {
    marginRight: 20,
    marginTop: 10,
    borderRadius: 10,
    elevation: 1,
    backgroundColor: Colors.white,
    width: "100%",

    minHeight: 100,
    marginBottom: 10,
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
  },
  modal: {
    borderRadius: 10,
    flex: 1,
    backgroundColor: Colors.newBackgroundColor,
  },
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
