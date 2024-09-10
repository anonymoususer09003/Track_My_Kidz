import { LinearGradientButton } from '@/Components';
import { UserState } from '@/Store/User';
import { useTheme } from '@/Theme';
import Colors from '@/Theme/Colors';
import { CardField, createToken } from '@stripe/stripe-react-native';
import { Card, IndexPath, Modal, Text } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const ParentPaymentModal = ({ onPay, onCancel, isVisible }) => {
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const amountValues = [
    { id: 0, amount: 500, label: '$5' },
    { id: 1, amount: 1000, label: '$10' },
    {
      id: 3,
      amount: 2000,
      label: '$20',
    },
    { id: 4, amount: 5000, label: '$50' },
    { id: 5, amount: 10000, label: '$100' },
  ];

  const { Layout } = useTheme();
  const [selectedAmountIndex, setSelectedAmountIndex] = useState<IndexPath | null>(null);
  const [cardData, setCardData] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [payment, setPayment] = useState(false);
  const [isCardCompleted, setIsCardCompleted] = useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const availableAmounts = [
    {
      amount: 1,
      label: '$50 - Annually (Best Deal)',
    },
    {
      amount: 5,
      label: '$4.99 - Monthly',
    },
  ];

  const dispatch = useDispatch();

  useEffect(() => {
    setPayment(false);
    setIsValid(false);
    setSelectedAmountIndex(null);
  }, [isVisible]);

  const createStripeToken = async (data) => {
    try {
      let token = await createToken(data);
    } catch (err) {
      console.log('err', err);
    }
  };
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
              textBreakStrategy={'highQuality'}
              style={{
                textAlign: 'center',
                color: '#606060',
                fontSize: 18,
              }}
            >
              Payment Info
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 30 }}>
          <CardField
            postalCodeEnabled={true}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: Colors.white,
              textColor: Colors.black,
            }}
            style={{
              width: '100%',
              height: 50,
              marginVertical: 30,
            }}
            onCardChange={(cardDetails) => {
              setIsCardCompleted(cardDetails?.complete);
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
          <LinearGradientButton
            disabled={isCardCompleted ? false : true}
            style={{
              borderRadius: 25,
              flex: 1,
              // backgroundColor: "red",
            }}
            appearance="ghost"
            size="medium"
            status="control"
            onPress={() => {
              onPay(cardData);
              // createStripeToken(cardData);
              // onPay();
            }}
          >
            Save
          </LinearGradientButton>
        </View>
        <View style={{ marginTop: 20 }} />
        <LinearGradientButton
          style={{
            borderRadius: 25,
            flex: 1,
          }}
          appearance="ghost"
          size="medium"
          status="control"
          onPress={() => {
            onCancel();
          }}
        >
          Cancel
        </LinearGradientButton>
      </Card>
    </Modal>
  );
};
export default ParentPaymentModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottom: {
    flex: 1,

    minHeight: 50,
    // maxHeight: 58,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 2,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
