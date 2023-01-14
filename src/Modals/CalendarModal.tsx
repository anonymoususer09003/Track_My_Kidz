import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import { Button, Calendar, Card, Modal, TabBar, Text } from "@ui-kitten/components";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { addMonths, format } from "date-fns";
import LinearGradient from "react-native-linear-gradient";
import { AppointmentsState } from "@/Store/Appointments";
// import SchedulerStyles from "@/Screens/Main/Scheduler/Styles/SchedulerStyles";
import { LinearGradientButton } from "@/Components";
import { Appointment } from "@/Models/Scheduler/appointment.interface";
import { CancelAppointment } from "@/Services/SchedulerService";
import GetAllLiveStreams from '@/Services/Livestream/GetAllLiveStreams'
import Toast from "react-native-toast-message";
import LoadAppointments from "@/Store/Appointments/LoadAppointments";
import moment from "moment";
import Colors from '@/Theme/Colors';

const SchedulerStyles = {};

const CalendarModal = () => {
    const isVisible = useSelector(
        (state: { modal: ModalState }) => state.modal.calendarModal,
    )
    const isServicesSelected = useSelector(
        (state: { modal: ModalState }) => state.modal.calendarModalTab,
    )
    const liveStream = { key: 'liveStream', color: 'magenta' };
    const service = { key: 'service', color: 'green' };
    const disabled = { key: 'disabled', color: 'red' };
    const [markedDates, setMarkedDates] = useState({
        '2021-10-25': { dots: [liveStream] },
        '2021-10-26': { dots: [service, liveStream], disabled: true },
        '2021-10-28': { dots: [disabled], disabled: true }
    })
    const [selectedTab, setSelectedTab] = useState(isServicesSelected)
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [maxDate, setMaxDate] = React.useState(addMonths(new Date(), 12));
    const appointments = useSelector((state: { appointments: AppointmentsState }) => state.appointments.item)
    const [livestreams, setLivestreams] = useState([]);
    const appointmentDays = appointments.map(it => {
        return new Date(it.appointmentTime)
    })
    const selectedDayAppointments = appointments.filter(it => new Date(it.appointmentTime).toDateString() == selectedDate.toDateString())

    const tabNames = ['Services', 'Livestreams']

    function cancelAppointment(item: Appointment) {
        dispatch(ChangeModalState.action({ loading: true }))
        CancelAppointment(item.serviceProvider.id, item.id).then(data => {
            Toast.show({
                type: 'success',
                text2: 'Appointment Canceled'
            })
            dispatch(LoadAppointments.action())
            setTimeout(() => {
                dispatch(ChangeModalState.action({ loading: false }))
            }, 1500)
        }, () => {
            Toast.show({
                type: 'info',
                text2: 'Appointment did not cancel please try again'
            })
            dispatch(ChangeModalState.action({ loading: false }))

        })
    }

    const getAllLivestreams = () => {
        GetAllLiveStreams().then(data => {
            setLivestreams(data);
        })
    }

    useEffect(() => {
        getAllLivestreams();
    }, []);

    const ScheduledAppointment = ({ item }: { item: Appointment }) => (
        <Card disabled={true} style={{ flex: 1, width: '100%', flexDirection: 'column' }}>
            <View style={[styles.scrollView, {
                flex: 1,
                borderWidth: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <View style={{ flex: 8, margin: 5, flexDirection: 'column' }}>
                    <Text category="p1">{
                        item.specificServices.map(it => it.name).toString()
                    }</Text>
                    <Text category="p1">{
                        item.serviceProvider.user.username
                    }</Text>
                    <Text category="p1">{
                        format(new Date(item.appointmentTime), "'at' HH:mm")
                    }</Text>
                </View>
                <Button size="small" onPress={() => {
                    cancelAppointment(item)
                }} style={{ margin: 5, flex: 4 }}>
                    Cancel
                </Button>
            </View>
        </Card>
    );
    const ScheduledLiveStream = ({ item }) => (
        <Card disabled={true} style={{ flex: 1, width: '100%', flexDirection: 'column' }}>
            <View style={[styles.scrollView, {
                flex: 1,
                borderWidth: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <View style={{ flex: 8, margin: 5, flexDirection: 'column' }}>
                    <Text category="p1">{
                        item?.creator?.username
                    }</Text>
                    <Text category="p1">{
                        item.title
                    }</Text>
                    <Text category="p1">{
                        format(new Date(item.scheduledDate), "'at' HH:mm")
                    }</Text>
                </View>
                <View>
                    <Button
                        disabled={moment(item.scheduledDate).format('yyyy-MM-dd hh:mm') === moment(selectedDate).format('yyyy-MM-dd hh:mm')}
                        style={[styles.buttonText, { 
                            backgroundColor: moment(item.scheduledDate).format('yyyy-MM-dd hh:mm') === moment(selectedDate).format('yyyy-MM-dd hh:mm') ? 
                            Colors.primary : Colors.lightgray, margin: 5, flex: 4 }]} size="small" onPress={() => {
                            Linking.openURL(item.participantsLink)
                        }}>
                        Join
                    </Button>
                    <Button appearance="outline" size="small" onPress={() => {
                    }} style={{ margin: 5, flex: 4 }}>
                        Decline
                    </Button>
                </View>
            </View>
        </Card>
    );
    const CalendarFooter = () => {
        return (
            <>
                <View style={styles.bottomContainer}>
                    {selectedDayAppointments.length == 0 && selectedTab == 0 && <Text style={{ marginTop: 5 }}>
                        You have no scheduled {selectedTab == 0 ? 'service' : 'livestream'} for date selected
                    </Text>}
                    {livestreams &&
                        livestreams.length > 0 &&
                        livestreams
                            .filter(_livestream => moment(_livestream.scheduledDate).format('yyyy-MM-dd') === moment(selectedDate).format('yyyy-MM-dd'))
                            .length == 0 &&
                        selectedTab == 1 && <Text style={{ marginTop: 5 }}>
                            You have no scheduled livestream for date selected
                        </Text>}
                    {selectedDayAppointments.length > 0 && <ScrollView style={
                        styles.scrollView
                    } contentContainerStyle={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexGrow: 1,

                    }}>
                        {selectedDayAppointments.map(it => {
                            return <ScheduledAppointment item={it} />
                        })}
                    </ScrollView>}

                    {selectedTab === 1 && livestreams && livestreams.length > 0 && (
                        <ScrollView style={
                            styles.scrollView
                        } contentContainerStyle={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexGrow: 1,

                        }}>
                            {livestreams.filter(_livestream => moment(_livestream.scheduledDate).format('yyyy-MM-dd') === moment(selectedDate).format('yyyy-MM-dd')).map(_livestream => {
                                return <ScheduledLiveStream item={_livestream} />
                            })}
                        </ScrollView>
                    )}


                </View>
                <View style={{ marginBottom: 10 }}>
                </View>
                <LinearGradientButton style={styles.closeButton}
                    size="small"
                    onPress={() => dispatch(ChangeModalState.action({ calendarModal: false }))
                    }>
                    Close
                </LinearGradientButton>
            </>)
    }
    const TopTabBar = () => (
        <TabBar
            selectedIndex={selectedTab}
            indicatorStyle={{ display: 'none' }}
            onSelect={index => setSelectedTab(index)}
        >
            {tabNames.map((tabName, index) => {
                if (selectedTab == index) {
                    return (
                        <Button
                            key={index}
                            style={[
                                styles.topNavButtonText,
                                styles.topNavBackground,
                                { backgroundColor: Colors.lightgray },
                            ]}
                            appearance="ghost"
                            size="tiny"
                            status="primary"
                        >
                            {tabName}
                        </Button>
                    )
                } else {
                    return (
                        <View
                            key={index}
                            style={styles.topNavBackground}
                        >
                            <Button
                                style={styles.topNavButtonText}
                                appearance="ghost"
                                size="tiny"
                                status="control"
                                onPress={() => setSelectedTab(index)}
                            >
                                {tabName}
                            </Button>
                        </View>
                    )
                }
            })}
        </TabBar>
    )
    const dispatch = useDispatch()

    return (
        <Modal
            style={styles.container}
            visible={isVisible != null && isVisible}
            backdropStyle={styles.backdrop}
            onBackdropPress={() =>
                dispatch(ChangeModalState.action({ calendarModal: false }))
            }
        >
            <ScrollView style={{
                backgroundColor: Colors.white,
                flex: 1,
                width: '100%'
            }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', margin: 5 }}>
                <TopTabBar />
                <Calendar
                    renderDay={({ date }, style) => {
                        if (selectedDate.toDateString() == date.toDateString()) {
                            return <View
                                style={[SchedulerStyles.dayContainer, style.container, { backgroundColor: Colors.green }]}>
                                <Text
                                    style={[SchedulerStyles.dayValue, style.text, { color: Colors.white }]}>{`${date.getDate()}`}</Text>
                            </View>
                        }
                        if (appointmentDays.find(it => {
                            return format(it, "yyyy-MM-dd") == format(date, "yyyy-MM-dd")
                        })) {
                            return <View
                                style={[SchedulerStyles.dayContainer, style.container, { backgroundColor: Colors.primary }]}>
                                <Text
                                    style={[SchedulerStyles.dayValue, style.text, { color: Colors.white }]}>{`${date.getDate()}`}</Text>
                            </View>
                        }
                        if (date.toDateString() == new Date().toDateString()) {
                            return <View
                                style={[SchedulerStyles.dayContainer, style.container, { backgroundColor: Colors.white }]}>
                                <Text
                                    style={[SchedulerStyles.dayValue, style.text, { color: 'black' }]}>{`${date.getDate()}`}</Text>
                            </View>
                        }
                        return <View
                            style={[SchedulerStyles.dayContainer, style.container]}>
                            <Text style={[SchedulerStyles.dayValue, style.text]}>{`${date.getDate()}`}</Text>
                        </View>
                    }}
                    date={selectedDate}
                    max={maxDate}
                    onSelect={nextDate => setSelectedDate(nextDate)}
                    style={{ width: '100%' }}
                />
                <CalendarFooter />
            </ScrollView>
            <Toast />
        </Modal>
    )
}

export default CalendarModal

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: '85%',
    }, bottomContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        flex: 1,
    },
    header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
    body: { flex: 3 },
    button: { marginTop: 5, marginBottom: 5, fontSize: 15 },
    bottom: { flex: 1, marginTop: 10 },
    buttonText: { backgroundColor: Colors.primary, color: Colors.white, fontSize: 15 },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    topNavBackground: {
        color: Colors.white,
        zIndex: -1,
        marginLeft: 2,
        marginRight: 2,
        borderRadius: 10,
        backgroundColor: Colors.primary
    },
    topNav: {
        color: Colors.white,
    },
    topNavText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    topNavButtonText: {
        borderRadius: 10,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        color: Colors.white,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        borderStyle: 'solid',
        borderColor: Colors.gray,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 5,
        width: '100%',
        flex: 1,
        borderWidth: 1,
    },
    closeButton: {
        width: '100%',
        borderRadius: 20
    },

})
