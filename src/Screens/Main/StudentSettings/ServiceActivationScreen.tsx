import { fetchPaymentIntent } from '@/Services/StripeServices';
import { loadUserId } from '@/Storage/MainAppStorage';
import FetchOne from '@/Store/User/FetchOne';
import { useTheme } from '@/Theme';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { Card, Radio, RadioGroup, Spinner, Text } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore

import { GetAllVariables } from '@/Services/Settings';
import { UserState } from "@/Store/User";
import Colors from '@/Theme/Colors';

const Header = (props: any) => (
    <View {...props}>
        <Text category='s1'>{props.title}</Text>
    </View>
);

const intervals = ['YEAR', 'MONTH']

const RadioOptions = ({ annual, monthly, switchOption }: { annual: any, monthly: any, switchOption: any }) => {

    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <React.Fragment>
            <RadioGroup
                selectedIndex={selectedIndex}
                onChange={index => { switchOption(index); setSelectedIndex(index) }}>
                <Radio>Annual - ${annual}/year (Better deal!!!)</Radio>
                <Radio>Monthly - ${monthly}/month</Radio>
            </RadioGroup>

        </React.Fragment>
    );
};

const ServiceActivationScreen = ({ route, navigation }: { route: any, navigation: any }) => {
    const [cardData, setCardData] = useState({})
    const [intervalOption, setIntervalOption] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const user = useSelector((state: { user: UserState }) => state.user.item)
    const { confirmPayment, loading } = useConfirmPayment();
    const { Layout } = useTheme()
    const dispatch = useDispatch()
    
    const [subscriptionType, setType] = useState(route.params);
    

    const [annualProductListing, setannualProductListing] = useState('')
    const [monthlyProductListing, setmonthlyProductListing] = useState('')

    const [annualServiceActivation, setannualServiceActivation] = useState('')
    const [monthlyServiceActivation, setmonthlyServiceActivation] = useState('')
    const [isValid, setIsValid] = useState(false)
    const getValuesForServices = async () => {

        GetAllVariables().then(res => {
            setannualProductListing(res.data?.annualProductActivation);
            setmonthlyProductListing(res.data?.monthlyProductActivation);
            setannualServiceActivation(res.data?.annualServiceActivation);
            setmonthlyServiceActivation(res.data?.monthlyServiceActivation);
            
        })
            .catch((error: any) => {
                Alert.alert('Services not loaded', '', [{ text: 'OK', style: 'cancel' }])
            })
    }
    useEffect(() => {
        getValuesForServices()
    }, [])

    const fetchPaymentIntentClientSecret = async (int: string) => {
        const paymentIntent = await fetchPaymentIntent(int, subscriptionType.type)
        
        
        return paymentIntent?.data
    }

    const activateSubscription = async () => {
        if (!cardData || !cardData?.complete) {
            
            return
        }
        setIsLoading(true)
        
        const int = intervals[intervalOption]
        
        //@ts-ignore
        const { clientSecret, subscriptionId } = await fetchPaymentIntentClientSecret(int)

        
        

        const billingDetails = {
            email: user?.email,
        };

        // Confirm the payment with the card details
        const { paymentIntent, error } = await confirmPayment(clientSecret, {
            type: 'Card',
            billingDetails,
        });

        if (error) {
            console.log('error',error)
            setIsLoading(false)
            ;
            Alert.alert('Payment confirmation error.', error.message, [{ text: 'OK', style: 'cancel' }])
        } else if (paymentIntent) {
            setIsLoading(false)
            const userId = await loadUserId()
            if (userId != null) {
                dispatch(FetchOne.action(userId))
            }
            ;
        }

    }

    const setOption = (opt: any) => {
        setIntervalOption(opt)
    }

    return (
        <>
            <View style={styles.layout}>
                <View style={[styles.mainLayout, { paddingHorizontal: 20 }]}>
                    <Card style={styles.card} header={<Header title={subscriptionType.type === 'product-activation' ? 'Product Listing' : 'Scheduler'} />}>
                        <RadioOptions switchOption={setOption} annual={subscriptionType.type === 'product-activation' ? annualProductListing : annualServiceActivation} monthly={subscriptionType.type === 'product-activation' ? monthlyProductListing : monthlyServiceActivation} />
                    </Card>
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
                                ;
                                setCardData(cardDetails)
                                if (cardDetails.complete) {
                                    setIsValid(true)
                                } else {
                                    setIsValid(false)
                                }
                            }}
                            onFocus={(focusedField) => {
                                ;
                            }}
                        />
                    </View>
                </View>
                <View style={styles.buttonsContainer}>
                    <View
                        style={[styles.background, !isValid && { opacity: 0.5 }]}
                    >
                        <TouchableOpacity
                            style={[styles.background, isLoading && { paddingTop: 10 }]}
                            disabled={!isValid}
                            onPress={() => activateSubscription()}>
                            {isLoading ?
                                <Spinner status="basic" />
                                :
                                <Text style={styles.button}>
                                    Activate
                                </Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.backgroundOutline}
                        onPress={() => navigation.navigate('Options')}
                    >
                        <Text style={styles.buttonOutline}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default ServiceActivationScreen

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        flexDirection: 'column',
    },
    mainLayout: {
        flex: 9,
        marginTop: 40,
    },
    icon: {
        width: 32,
        height: 32
    },
    card: {
        height: 'auto',
        margin: 2,
    },
    background: {
        width: '80%',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
        marginBottom: 10,
        backgroundColor: Colors.primary
    },
    button: {
        fontSize: 15,
        color: Colors.white,
        borderRadius: 10,
        paddingTop: 6
    }, buttonsContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    backgroundOutline: {
        backgroundColor: Colors.transparent,
        marginBottom: 10,
        width: '80%',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        color: Colors.primaryTint,
        paddingBottom: 6,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    buttonOutline: {
        fontSize: 15,
        color: Colors.primary,
        borderRadius: 10,
        paddingTop: 6,
    },
})
