import { Card, IndexPath, Modal, Radio, RadioGroup, Text } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { ModalState } from '@/Store/Modal';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import { useTheme } from '@/Theme';
import { AppHeader, LinearGradientButton } from '@/Components';
import ChangeSelectedState from '@/Store/Selected/ChangeSelectedState';
import Toast from 'react-native-toast-message';
import {
  GetCardDetail,
  UpdateCard,
  SaveCardDetail,
  CreateSinglePaymentIntent,
} from '@/Services/Payments';
import Colors from '@/Theme/Colors';
import { CardField, useConfirmPayment, useStripe } from '@stripe/stripe-react-native';
import { FlatList, TouchableOpacity } from 'react-native';
import { UpdatePaymentModal } from '@/Modals';
import BackgroundLayout from '@/Components/BackgroundLayout';
const PaymentInformationScreen = ({ navigation }) => {
  const { createPaymentMethod } = useStripe();
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const [cardDetail, setCardDetail] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [payment, setPayment] = useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [paymentIntent, setPaymentIntent] = useState();
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
  const fetchPaymentIntentClientSecret = async (data: any) => {
    const paymentIntent = await CreateSinglePaymentIntent(selectedIndex == 0 ? 50 : 4.99);
    let body = {
      ...data,
      token: paymentIntent?.paymentIntentId,
      price: selectedIndex == 0 ? '50' : '4.99',
    };

    cardDetail ? updateCardInfo({ ...cardDetail, ...body }) : saveCardInfo(body);
    // setPayment(paymentIntent);
  };
  // useEffect(() => {
  //   setPayment(false);
  //   setIsValid(false);
  //   setSelectedAmountIndex(null);
  // }, [isVisible]);

  const RadioOptions = ({
    selectedIndex,
    setSelectedIndex,
  }: {
    selectedIndex: any;
    setSelectedIndex: any;
  }) => {
    return (
      <React.Fragment>
        <RadioGroup selectedIndex={selectedIndex} onChange={(index) => setSelectedIndex(index)}>
          {availableAmounts.map((it, index) => {
            return (
              <Radio
                key={it.amount}
                style={[
                  styles.radioButton,
                  {
                    borderColor: selectedIndex == index ? Colors.primaryTint : 'transparent',
                  },
                ]}
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
  const getCardInfo = async () => {
    try {
      let res = await GetCardDetail();
      if (res) {
        res?.price == '4.99' ? setSelectedIndex(1) : setSelectedIndex(0);
        setCardDetail(res);
      }
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    getCardInfo();
  }, []);

  // useEffect(() => {
  //   fetchPaymentIntentClientSecret();
  // }, [selectedIndex]);
  // @ts-ignore
  const saveCardInfo = async (cardInfo: any) => {
    try {
      let saveCardInfo = await SaveCardDetail(cardInfo);

      setIsVisible(false);
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Card added Successfully',
      });
      getCardInfo();
    } catch (err) {
      console.log('err------', err);
    }
  };

  const updateCardInfo = async (cardInfo: any) => {
    try {
      let saveCardInfo = await UpdateCard(cardInfo);

      setIsVisible(false);
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Card Updated Successfully',
      });
      getCardInfo();
    } catch (err) {
      console.log('err------', err);
    }
  };
  return (
    <BackgroundLayout title="Payment Information">
      <AppHeader hideCalendar={true} hideCenterIcon={true} />
      <View style={styles.container}>
        <UpdatePaymentModal
          onPay={async (data: any) => {
            fetchPaymentIntentClientSecret(data);

            // setIsVisible(false)
          }}
          onCancel={() => {
            setIsVisible(false);
          }}
          isVisible={isVisible}
        />
        <View style={styles.modal} disabled={true}>
          <View style={styles.body}>
            <RadioOptions selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          {cardDetail && (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold' }}>{'Card Number: '}</Text>
                <Text>{`xxxx-xxxx-xxxx-${cardDetail?.last4}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold' }}>{'CVC: '}</Text>
                <Text>***</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold' }}>{'Exp Date: '}</Text>
                <Text>{`${cardDetail?.expiryMonth < 10 ? '0' : ''}${cardDetail?.expiryMonth}/20${
                  cardDetail?.expiryYear
                }`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold' }}>{'Zip (Postal) Code: '}</Text>
                <Text>{cardDetail?.postalCode}</Text>
              </View>
            </View>
          )}

          {!cardDetail && (
            <Text
              style={{
                marginTop: 30,
                alignSelf: 'center',
                color: Colors.fieldLabel,
                fontSize: 20,
              }}
            >
              No Card Information
            </Text>
          )}
        </View>

        <View style={{ marginTop: 30 }} />
        <LinearGradientButton onPress={() => setIsVisible(true)}>
          {cardDetail ? 'Update' : 'Add'}
        </LinearGradientButton>
      </View>
    </BackgroundLayout>
  );
};
export default PaymentInformationScreen;

const styles = StyleSheet.create({
  container: {
    // minHeight: 192,
    flex: 1,

    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
    padding: 30,
  },
  radioButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingLeft: 10,
  },
  card: {
    minHeight: 100,

    width: '100%',
    marginBottom: 5,
    // borderWidth: 2,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  modal: { borderRadius: 10 },
  header: {},
  body: {},
  background: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.white,
    zIndex: -1,
  },
  btn: {
    padding: 10,
    borderWidth: 1,
    width: '60%',
    borderRadius: 6,
    backgroundColor: Colors.primary,
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
    flexDirection: 'row',
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
