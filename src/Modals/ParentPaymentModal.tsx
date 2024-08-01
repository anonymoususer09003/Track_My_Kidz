import { Card, IndexPath, Modal, Radio, RadioGroup, Text } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { GetParent } from '@/Services/Parent';
import { ModalState } from '@/Store/Modal';
import { LinearGradientButton } from '@/Components';
import { CreateSinglePaymentIntent, CreateSingleEmailPaymentIntent } from '@/Services/Payments';
import { UpdateUser } from '@/Services/SettingsServies';
import { loadUserId, storeIsSubscribed } from '@/Storage/MainAppStorage';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import Colors from '@/Theme/Colors';

interface ParentPaymentModalProps {
  onPay?: any;
  onCancel?: any;
  loginObj?: any;
  userEmail?: string;
}

const ParentPaymentModal = ({ onCancel, loginObj, userEmail, onPay }: ParentPaymentModalProps) => {
  const user = useSelector((state: { user: UserState }) => state.user.item);
  console.log(user);
  // const {createToken} = useStripe();
  const { confirmPayment } = useConfirmPayment();

  // const [, setIntervalOption] = useState(0);
  // const {Layout} = useTheme();

  const [, setSelectedAmountIndex] = useState<IndexPath | null>(null);
  const [cardData, setCardData] = useState<any>({});
  const [, setIsValid] = useState<boolean>(false);
  const [isCardCompleted, setIsCardCompleted] = useState<boolean>(false);
  const [, setPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setParent] = useState(null);
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
  const intervals = ['YEAR', 'MONTH'];
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.parentPaymentModalVisibility
  );
  console.log('isVisible', isVisible);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('----------------------------');
    console.log('inside useEffect');
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
        <RadioGroup selectedIndex={selectedIndex} onChange={(index) => setSelectedIndex(index)}>
          {availableAmounts.map((it) => {
            return (
              <Radio key={it.amount} style={{ paddingLeft: 20, marginVertical: 15 }}>
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

  const getUser = async () => {
    const id = (await loadUserId()) || '';
    GetParent(parseInt(id, 0)).then((response) => {
      console.log('ParentPaymentModal.tsx line 104', response);
      setParent(response);
    });
  };
  const fetchPaymentIntentClientSecret = async (data: any) => {
    if (userEmail) {
      return await CreateSingleEmailPaymentIntent({
        amountToPay: selectedIndex == 0 ? 50 : 4.99,
        email: userEmail,
      });
    } else {
      return await CreateSinglePaymentIntent(selectedIndex == 0 ? 50 : 4.99);
    }
  };

  const activateSubscription = async () => {
    if (!cardData || !cardData?.complete) {
      return;
    }
    setIsLoading(true);

    const int = intervals[selectedIndex];

    //@ts-ignore
    const { clientSecret } = await fetchPaymentIntentClientSecret(int);

    const billingDetails = {
      email: userEmail || user?.email,
    };

    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails,
      },
    });

    console.log('method', clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails,
      },
    });
    console.log('paymentIntent', paymentIntent);
    if (error) {
      console.log('err', error);
      setIsLoading(false);
      Alert.alert('Payment confirmation error.', error.message, [{ text: 'OK', style: 'cancel' }]);
    } else if (paymentIntent) {
      setIsLoading(false);
      if (!userEmail) {
        await updateUser();
      }
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Payment Successfull',
      });
      onPay();

      dispatch(
        ChangeModalState.action({
          parentPaymentModalVisibility: false,
        })
      );
    }
  };
  const updateUser = async () => {
    try {
      console.log('userrrrr', loginObj);
      let data = { ...loginObj };
      if (!userEmail) {
        data = {
          id: user?.parentId,
          email: user?.email,
          firstname: user?.firstname,
          lastname: user?.lastname,
          apt: user?.apt || '',
          address: user?.address || '',
          state: user?.state || '',
          country: user?.country || '',
          city: user?.city || '',
          zipcode: user?.zipcode || '',
          phone: user?.phone,
          status: null,
          activationCode: user?.referenceCode,
          term: null,
        };
      }

      console.log('data', data);
      console.log('data202020020202020202', { ...data, isSubscribed: true });
      let res = await UpdateUser({ ...loginObj, isSubscribed: true }, 'parent');
      console.log('res----------99999999999 is update', res);
      await storeIsSubscribed(true);
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    getUser().catch(console.error);
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
          <RadioOptions selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
        </View>
        <View style={{ marginTop: 30 }}>
          <CardField
            postalCodeEnabled={true}
            // placeholder={{
            // number: '4242 4242 4242 4242',
            // }}
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
            // onFocus={focusedField => {
            // }}
          />
          <Text style={{ color: 'red' }}>
            {selectedIndex == 0
              ? 'First payment is prorated. Subsequent payment is made on first of every year. '
              : 'First payment is prorated. Subsequent payment is made on first of every month.'}
          </Text>
        </View>
        <View style={styles.bottom}>
          {!isLoading ? (
            <View style={styles.buttonText}>
              <LinearGradientButton
                disabled={!isCardCompleted}
                style={{
                  borderRadius: 25,
                  flex: 1,
                }}
                appearance="ghost"
                size="medium"
                status="control"
                onPress={() => {
                  activateSubscription().catch(console.error);
                }}
              >
                Pay
              </LinearGradientButton>
            </View>
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} />
          )}

          {!isLoading && (
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
                  // DeclineToGift().then();
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
          )}
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
