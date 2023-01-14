import {
  Card,
  IndexPath,
  Modal,
  Radio,
  RadioGroup,
  Text,
  Spinner,
} from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import { GetParent } from "@/Services/Parent";

import React, { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import { DeclineToGift } from "@/Services/GiftService";
import Colors from "@/Theme/Colors";
import { CreateSinglePaymentIntent } from "@/Services/Payments";
import {
  CardField,
  useConfirmPayment,
  useStripe,
} from "@stripe/stripe-react-native";
import { fetchPaymentIntent } from "@/Services/StripeServices";
import { loadUserId } from "@/Storage/MainAppStorage";
import Toast from "react-native-toast-message";
import FetchOne from "@/Store/User/FetchOne";
import { UpdateUser } from "@/Services/SettingsServies";
import { storeIsSubscribed } from "@/Storage/MainAppStorage";
const ParentPaymentModal = ({ onPay, onCancel }) => {
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const { createToken } = useStripe();
  const { confirmPayment, loading } = useConfirmPayment();

  const [intervalOption, setIntervalOption] = useState(0);
  const { Layout } = useTheme();

  const [selectedAmountIndex, setSelectedAmountIndex] =
    useState<IndexPath | null>(null);
  const [cardData, setCardData] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [payment, setPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parent, setParent] = useState(null);
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
  const intervals = ["YEAR", "MONTH"];
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.parentPaymentModalVisibility
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setPayment(false);
    setIsValid(false);
    setSelectedAmountIndex(null);
  }, [isVisible]);

  const RadioOptions = ({
    selectedIndex,
    setSelectedIndex,
  }: {
    selectedIndex: any;
    setSelectedIndex: any;
  }) => {
    return (
      <React.Fragment>
        <RadioGroup
          selectedIndex={selectedIndex}
          onChange={(index) => setSelectedIndex(index)}
        >
          {availableAmounts.map((it) => {
            return (
              <Radio
                key={it.amount}
                style={{ paddingLeft: 20, marginVertical: 15 }}
              >
                {(evaProps) => (
                  <Text {...evaProps} style={{ fontSize: 20, paddingLeft: 15 }}>
                    {it.label}
                  </Text>
                )}
              </Radio>
            );
          })}
        </RadioGroup>
      </React.Fragment>
    );
  };

  const setOption = (opt: any) => {
    setIntervalOption(opt);
  };
  const getUser = async () => {
    const id = await loadUserId();
    GetParent(parseInt(id, 0)).then((response) => {
      console.log("res-00-20-20--0", response);
      setParent(response);
    });
  };
  const fetchPaymentIntentClientSecret = async (data: any) => {
    // let res = await createToken({
    //   type: "Card",
    //   name: "David Wallace",
    //   currency: "usd",
    // });
    // console.log("res", res);
    const paymentIntent = await CreateSinglePaymentIntent(
      selectedIndex == 0 ? 50 : 4.99
    );
    return paymentIntent;
    // setPayment(paymentIntent);
    // console.log("paymentIntent", paymentIntent);
  };
  // const fetchPaymentIntentClientSecret = async (int: string) => {
  //   // const int = intervals[selectedIndex];
  //   const paymentIntent = await fetchPaymentIntent(int);

  //   return paymentIntent?.data;
  // };
  const activateSubscription = async () => {
    // Alert.alert("kkaa");
    if (!cardData || !cardData?.complete) {
      return;
    }
    setIsLoading(true);

    const int = intervals[selectedIndex];

    //@ts-ignore
    const { clientSecret } = await fetchPaymentIntentClientSecret(int);

    const billingDetails = {
      email: user?.email,
    };

    // Confirm the payment with the card details
    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      paymentMethodType: "Card",
      paymentMethodData: billingDetails,
    });
    console.log("paymentIntent", paymentIntent);
    if (error) {
      console.log("err", error);
      setIsLoading(false);
      Alert.alert("Payment confirmation error.", error.message, [
        { text: "OK", style: "cancel" },
      ]);
    } else if (paymentIntent) {
      setIsLoading(false);
      updateUser();
      // const userId = await loadUserId();
      // if (userId != null) {
      //   dispatch(FetchOne.action(userId));
      // }
      Toast.show({
        type: "success",
        position: "top",
        text1: "Payment Successfull",
      });
      dispatch(
        ChangeModalState.action({
          parentPaymentModalVisibility: false,
        })
      );
    }
  };
  const updateUser = async () => {
    try {
      let res = await UpdateUser(
        { ...user, id: user?.parentId, isSubscribed: true },
        "parent"
      );
      console.log("res", res);
      await storeIsSubscribed(true);
    } catch (err) {
      console.log("err", err);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        // onCancel();
        // dispatch(
        //     ChangeModalState.action({ parentPaymentModalVisibility: false }),
        // )
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
              Payment Info
            </Text>
          </View>
          <RadioOptions
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        </View>
        <View style={{ marginTop: 30 }}>
          <CardField
            postalCodeEnabled={true}
            placeholder={{
              number: "4242 4242 4242 4242",
            }}
            cardStyle={{
              backgroundColor: Colors.white,
              textColor: Colors.black,
            }}
            style={{
              width: "100%",
              height: 50,
              marginVertical: 30,
            }}
            onCardChange={(cardDetails) => {
              setCardData(cardDetails);
              if (cardDetails.complete) {
                setIsValid(true);
              } else {
                setIsValid(false);
              }
            }}
            onFocus={(focusedField) => {}}
          />
        </View>
        <View style={styles.bottom}>
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
                    parentPaymentModalVisibility: false,
                  })
                );
                onCancel();
              }}
            >
              Cancel
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
                activateSubscription();
              }}
            >
              Pay
            </LinearGradientButton>
          </View>
        </View>
      </Card>
    </Modal>
  );
};
export default ParentPaymentModal;

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
    minHeight: 50,
    // maxHeight: 58,
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
