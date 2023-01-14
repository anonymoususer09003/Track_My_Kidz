import {
  Card,
  IndexPath,
  RadioGroup,
  Text,
  CheckBox,
  Icon,
} from "@ui-kitten/components";
import { actions } from "@/Context/state/Reducer";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import { DeclineToGift } from "@/Services/GiftService";
import Colors from "@/Theme/Colors";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useStateValue } from "@/Context/state/State";
import { useNavigation } from "@react-navigation/native";
import { DeleteActivity } from "@/Services/Activity";
const MarkAllModal = ({
  visible,
  setVisible,
  onSave,
}: {
  visible: any;
  setVisible: any;
  onSave: any;
}) => {
  const navigation = useNavigation();
  //   const user = useSelector((state: { user: UserState }) => state.user.item);
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
  const [to, setTo] = useState(false);
  const [from, setFrom] = useState(false);
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
  //   const isVisible = useSelector(
  //     (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  //   );
  //   console.log("item", item);
  const dispatch = useDispatch();
  const [{ item: activity }, _dispatch] = useStateValue();
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      isVisible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        setVisible();
      }}
    >
      <View style={{ backgroundColor: Colors.white, paddingVertical: 20 }}>
        <Text style={{ fontSize: 20, textAlign: "center" }}>Mark All</Text>
        <View
          style={{ flexDirection: "row", paddingHorizontal: 20, marginTop: 10 }}
        >
          <View tyle={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold" }}>To</Text>
            <View>
              <CheckBox
                style={{ marginRight: 20 }}
                checked={to}
                onChange={(value) => setTo(value)}
              >
                {""}
              </CheckBox>
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold" }}>From</Text>
            <View>
              <CheckBox
                style={{ marginRight: 20 }}
                checked={from}
                onChange={(value) => setFrom(value)}
              >
                {""}
              </CheckBox>
            </View>
          </View>
        </View>
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => {
              onSave(to, from);
            }}
          >
            <Text style={{ color: Colors.white }}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => {
              setVisible();
            }}
          >
            <Text style={{ color: Colors.white }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
export default MarkAllModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    // flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
    zIndex: 1990,
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
    alignSelf: "center",
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
  textStyle: {
    width: "75%",
    // backgroundColor: "red",
    textAlign: "center",
    color: Colors.white,
    fontWeight: "bold",
  },
  buttonStyle: {
    padding: 5,
    alignItems: "center",
    //   justifyContent: "center",
    //   padding: 5,
    width: "100%",
    height: 50,
    backgroundColor: Colors.tintgray,
    borderRadius: 4,
    flexDirection: "row",
    paddingLeft: 20,
    marginBottom: 10,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
