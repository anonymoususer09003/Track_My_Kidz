import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { SelectedState } from "@/Store/Selected";
import { AuthStackHeader, LinearGradientButton } from "@/Components";
import { useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
    CheckBox,
    Divider, Icon,
    IndexPath,

    Select,
    SelectItem,
    Text,
    TopNavigation,
    TopNavigationAction
} from "@ui-kitten/components";
import Modal from 'react-native-modal'
import uuid from "react-native-uuid";
import { AppointmentPostDto, SpecificService } from "@/Models/UserDTOs";
import { addDays, addHours, addMinutes, format, parse } from "date-fns";
import { AddAppointment, GetAppointmentsPerDay } from "@/Services/SchedulerService";
import { Appointment } from "@/Models/Scheduler/appointment.interface";
import Toast from "react-native-toast-message";
import SchedulerCalendar from "@/Screens/Main/Scheduler/SchedulerCalendar";
import { AppointmentTime } from "@/Screens/Main/Scheduler/Interfaces/scheduler.props.interface";
import SchedulerTimePicker from "@/Screens/Main/Scheduler/SchedulerTimePicker";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import LoadAppointments from "@/Store/Appointments/LoadAppointments";
import { ModalState } from "@/Store/Modal";
import Colors from '@/Theme/Colors';

const ScheduleAppointmentModal = () => {

    const isVisible = useSelector(
        (state: { modal: ModalState }) =>
            state.modal.scheduleAppointmentModal,
    )

    const selectedUser = useSelector((state: { selected: SelectedState }) => state.selected.selectedUserData)
    const [availableServices, setAvailableServices] = useState<SpecificService[]>([])
    const [selectedSpecificServicesNames, setSelectedSpecificServicesNames] = useState<string>('')
    const [selectedSpecificServicesIndexes, setSelectedSpecificServicesIndexes] = useState<IndexPath[]>([])
    const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), -2))
    const navigation = useNavigation()
    const schedulerInfo = selectedUser?.serviceProvider;
    if (selectedUser == null || schedulerInfo == null)
        return (<><AuthStackHeader title= { "Scheduler "} navigation = { navigation } /> </>)
    const selectedMenusIds = schedulerInfo.specificServices.map(it => it.menuId)
    const [times, setTimes] = React.useState<AppointmentTime[]>([]);
    const [setupComplete, setSetupComplete] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

    const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    let appointments: Appointment[] = []
 
    function loadBlockedTimes(timesArr: AppointmentTime[]) {
        let timeSlot = timesArr;
        appointments.forEach(data => {
            const startHour = new Date(data.appointmentTime)
            const serviceTimes = data.specificServices.map(it => it.serviceTime).reduce((sum, current) => sum + current, 0)
            let endTime = addMinutes(startHour, serviceTimes)
            const bufferTime = schedulerInfo?.bufferMinutes
            if (bufferTime && bufferTime > 0) {
                endTime = addMinutes(endTime, (bufferTime - 15))
            }
            timeSlot = fillBlockedTimes(startHour, endTime, timeSlot)
        })
        setErrorMessage("")
        setTimes(timeSlot)
    }

    const loadAppointments = (nextDate: Date) => {
        GetAppointmentsPerDay(selectedUser.id, addHours(nextDate, 23)).then(data => {
            appointments = data;
            loadTimes(nextDate)
            setSetupComplete(false)
        })
    }

    const loadTimes = (nextDate: Date) => {
        const day = weekDays[nextDate.getDay()];
        const openDayConf = (schedulerInfo && schedulerInfo.openDays && schedulerInfo.openDays.length > 0 && schedulerInfo.openDays.find(it => it.day == day)) || null;
        if (openDayConf == null) return;
        const startHour = parse(openDayConf.startHour, 'HH:mm:ss', new Date())
        const endHour = parse(openDayConf.endHour, 'HH:mm:ss', new Date())
        fillTimesArray(startHour, endHour);
    }

    function addAppointmentTime(startHour: Date): AppointmentTime {
        const timeLabel = format(startHour, "HH:mm")
        return {
            bufferTime: false,
            selected: false,
            timeLabel: timeLabel,
            blocked: false
        }
    }

    function setBlockedAppointmentTime(appointments: AppointmentTime[], timeLabel: string) {
        const timeSlot = appointments.find(it => it.timeLabel == timeLabel);
        if (timeSlot)
            timeSlot.blocked = true
    }

    const fillBlockedTimes = (startHour: Date, endHour: Date, appointments: AppointmentTime[]) => {
        const timeLabel = format(startHour, "HH:mm")
        setBlockedAppointmentTime(appointments, timeLabel)
        let start = addMinutes(startHour, 15);
        while (start.getTime() < endHour.getTime()) {
            const timeLabel = format(start, "HH:mm")
            setBlockedAppointmentTime(appointments, timeLabel)
            start = addMinutes(start, 15);
        }
        return appointments;
    }

    const fillTimesArray = (startHour: Date, endHour: Date) => {
        let timesArr: AppointmentTime[] = [];
        timesArr.push(addAppointmentTime(startHour))
        let start = addMinutes(startHour, 15);
        while (start.getTime() < endHour.getTime()) {
            timesArr.push(addAppointmentTime(start))
            start = addMinutes(start, 15);
        }
        timesArr.push(addAppointmentTime(endHour))
        loadBlockedTimes(timesArr)
    }

    const RightDrawerAction = () => (
        <TopNavigationAction
            icon= {(props: any) => <Icon { ...props } name = "close-circle-outline" fill = {Colors.white} />}
onPress = {() => {
    dispatch(
        ChangeModalState.action({ scheduleAppointmentModal: false }),
    )
}
            }
/>
    )

function updateTimepickerWithSelectedTimes(startTime: Date, endTime: Date, endBufferTime?: Date) {
    setErrorMessage("")
    const updatedTimes = times;
    if (updatedTimes.length == 0) return;
    updatedTimes.forEach(it => {
        it.selected = false;
        it.bufferTime = false;
    })
    let setupOk = true;
    updatedTimes.forEach(time => {
        const dateTime = parse(time.timeLabel, 'HH:mm', 0);
        if (dateTime.getTime() >= startTime.getTime() && dateTime.getTime() <= endTime.getTime()) {
            time.selected = true;
        } else if (endBufferTime != null && dateTime.getTime() >= endTime.getTime() && dateTime.getTime() <= endBufferTime.getTime()) {
            time.selected = true;
            time.bufferTime = true;
        }
        if (time.blocked && (time.selected || time.bufferTime)) {
            setupOk = false;
        }
    });
    setTimes([...updatedTimes]);
    const closingHour = parse(updatedTimes[updatedTimes.length - 1].timeLabel, 'HH:mm', 0);
    if (closingHour.getTime() < endTime.getTime() || (endBufferTime != null && closingHour.getTime() < endBufferTime.getTime())) {
        setupOk = false;
        setErrorMessage("Your selected services time exceed closing time please select another timeslot")
    } else if (!setupOk) {
        setErrorMessage("Cannot select a time that is picked by someone else")
    }
    if (setupOk) {
        setSelectedTimeSlot(startTime.getHours() + ":" + startTime.getMinutes())
    }
    setSetupComplete(setupOk)
}

function onTimeSelect(timeSelected: AppointmentTime) {
    if (selectedSpecificServicesIndexes.length == 0) {
        Toast.show({
            type: 'info',
            text2: `Select your services first`
        })
    } else {
        const selectedServices: SpecificService[] = [];
        selectedSpecificServicesIndexes.forEach(it => {
            selectedServices.push(availableServices[it.row])
        })
        let totalTime = 0
        selectedServices.forEach(it => {
            totalTime += it.serviceTime;
        })
        const startTime = parse(timeSelected.timeLabel, 'HH:mm', 0);
        const endTime = addMinutes(startTime, totalTime);
        if (schedulerInfo?.bufferMinutes == null || schedulerInfo?.bufferMinutes == 0) {
            updateTimepickerWithSelectedTimes(startTime, endTime)
        } else {
            const endBufferTime = addMinutes(endTime, schedulerInfo?.bufferMinutes ?? 0)
            updateTimepickerWithSelectedTimes(startTime, endTime, endBufferTime)
        }
    }
}

const dispatch = useDispatch()
function scheduleAppointment() {
    const specificServicesSelected = selectedSpecificServicesIndexes.map(it => schedulerInfo?.specificServices[it.row].id);
    const hourSelected = +selectedTimeSlot.split(":")[0]
    const minutesSelected = +selectedTimeSlot.split(":")[1]
    let date = selectedDate;
    date = addMinutes(date, minutesSelected)
    date = addHours(date, hourSelected)
    const appointmentPost = {
        appointmentTime: date,
        note: "",
        specificServices: specificServicesSelected
    } as AppointmentPostDto;
    dispatch(ChangeModalState.action({ loading: true }))
    AddAppointment(schedulerInfo?.id ?? "", appointmentPost).then(() => {
        appointmentScheduledAlert()
        dispatch(ChangeModalState.action({ loading: false }))
        dispatch(LoadAppointments.action())

    }).catch(() => {
        dispatch(ChangeModalState.action({ loading: false }))

        Toast.show({
            type: 'info',
            text2: 'An error occurred. Please try again later'
        })
    })
}

const appointmentScheduledAlert = () =>
    Alert.alert(
        "Appointment",
        "Appointment scheduled successfully",
        [
            {
                text: "OK", onPress: () => {
                    navigation.goBack()
                }
            }
        ]
    );

if (!isVisible) return (<></>);

    return (
    <Modal
            isVisible= { isVisible }
coverScreen = { true}
style = {{ margin: 0 }}
onBackdropPress = {() => {
    dispatch(
        ChangeModalState.action({ scheduleAppointmentModal: false }),
    )
}}
        >


    <ScrollView style={ styles.layout } contentContainerStyle = {{ flexGrow: 1 }}>
        <Toast />

        <View
style = { styles.background }
    >
    <TopNavigation
                        style={ styles.topNav }
title = {() => <Text style={
    {
        color: Colors.white, marginLeft: 20, fontSize: 18
    }
}> Scheduler For + selectedUser.firstName < /Text>}
appearance = "control"
alignment = "start"
accessoryRight = { RightDrawerAction }
    />
    </View>
    < View style = {{ flex: 90 }}>
        <View style={ styles.section }>
            <View style={
    {
        alignSelf: 'center',
            width: '90%',
                flex: 10,
                    flexWrap: 'wrap',
                        flexDirection: 'row'
    }
}> <Text>Select Services < /Text></View >
    <View style={
    {
        alignSelf: 'center',
            borderStyle: 'solid',
                borderColor: Colors.gray,
                    borderWidth: 1,
                        width: '90%',
                            flex: 100,
                                flexWrap: 'wrap',
                                    flexDirection: 'row'
    }
}>
{
    selectedMenus.map((menuItem) => {
        return (
            <CheckBox key= { uuid.v4().toString() } style = {
                [{
                    width: '40%', margin: 10
                }]} checked = { menuItem.selected }
        onChange = {() => {
            menuItem.selected = !menuItem.selected
            setSelectedMenus([...selectedMenus])
            const selectedMenuIds = selectedMenus.filter(menu => menu.selected).map(it => it.menu.id);
            setAvailableServices(schedulerInfo?.specificServices.filter(it => selectedMenuIds.indexOf(it.menuId) != -1))

        }
    }>
    { menuItem.menu.title }
    < /CheckBox>
    )
})}

</View>
    < /View>
    < Divider />
    <View style={ styles.section }>
        <View style={
    {
        alignSelf: 'center',
            width: '90%',
                flex: 10,
                    zIndex: 100,
                        flexWrap: 'wrap',
                            flexDirection: 'row'
    }
}>

    <Select
                                style={ styles.selectInput }
selectedIndex = { selectedSpecificServicesIndexes }
value = { selectedSpecificServicesNames }
multiSelect = { true}
onSelect = {(indexes: IndexPath | IndexPath[]) => {
    if (!(indexes instanceof IndexPath)) {
        setSelectedSpecificServicesIndexes(indexes)
        setSelectedSpecificServicesNames('')
        let newValue: string[] = []
        indexes.forEach(index => {
            if (!selectedMenus[0]?.selected && selectedMenus[1]?.selected) {
                newValue.push(schedulerInfo.specificServices[2].name)
            }
            else
                newValue.push(schedulerInfo.specificServices[index.row].name)
        })
        setSelectedSpecificServicesNames(newValue.toString())
    }

}}
label = {() => (
    <Text>Specific Services < /Text>
                                )}
placeholder = "Select Specific Services"
    >
{
    availableServices.map((specificService, index) => {
        return <SelectItem key={ index } title = { specificService.name } />
                                })
}
    < /Select>

    < /View>
    < /View>
    < Divider />
    <View style={ styles.section }>
        <SchedulerCalendar onSelect={
    (nextDate) => {
        setSelectedDate(nextDate)
        loadAppointments(nextDate)
    }
} selectedDate = { selectedDate } selectedUserData = { selectedUser }
    />
    </View>
    < Divider />
    <View style={ styles.section }>
        <SchedulerTimePicker onSelect={ onTimeSelect } times = { times } />
            { errorMessage != "" && (<Text style={ { color: 'red' } } category = "p1" > { errorMessage } < /Text>)}
                < /View>

                < Divider />
                </View>
                < View style = { styles.bottomView } >
                    <LinearGradientButton
                        disabled={ !setupComplete }
size = "small"
style = {
                            {
    width: '100%',
        flex: 1,
            alignSelf: 'center'
}
                        }
onPress = {() => {
    scheduleAppointment()
}}
                    >
    Schedule
    < /LinearGradientButton>
    < /View>
    < /ScrollView>
    < /Modal>


    )


}

export default ScheduleAppointmentModal


const styles = StyleSheet.create({
    carousel: {
        height: 50,
        marginLeft: 5,
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: '100%',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: Colors.white,
        elevation: 5, // Android
    },
    layout: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: Colors.white,
        flexDirection: 'column',
    },
    bottomBar: {
        flex: 1,
    },
    hoursOfOperation: {
        flex: 1,
        width: '95%',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    hoursOfOperationRow: {
        flex: 1,
        justifyContent: 'space-evenly',
        flexDirection: 'row'
    },
    hoursOfOperationItem: {
        flex: 1,
        margin: 10
    },
    section: {
        flex: 1,
        margin: 5,
        justifyContent: 'space-evenly',
        alignSelf: 'center',
        width: '100%',
        flexDirection: 'column',

    },
    dayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1,
    },
    dayValue: {
        alignSelf: 'center',
        fontSize: 12,
        fontWeight: '400',
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    registerButton: {
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 20,
    },
    passwordInput: {
        marginTop: 16,
    },
    input: {
        marginTop: 16,
    },
    dateInput: {
        marginTop: 10,
        marginBottom: 10,
        flex: 1,
        flexDirection: 'row',
    },
    inputCheckboxInvitation: {
        marginEnd: 16,
    },
    selectInput: {
        marginTop: 16,
        width: '100%',
    },

    errorText: {
        fontSize: 10,
        color: 'red',
    },
    formContainer: {
        // paddingTop: 32,
        flex: 2,
        paddingHorizontal: 16,
    },
    formView: {
        flex: 9,
    },
    bottomView: {
        flex: 1,
        bottom: 0,
        marginBottom: 20,
        width: '100%',
        maxHeight: 100,
        marginTop: 20,
        flexDirection: 'row',
    },
    startLivestreamButton: {
        margin: 8,
        width: '95%',
        right: 0,
    },
    ghostButton: {
        margin: 8,
        width: '95%',
        left: 0,
    },
    background: {
        flex: 1,
        flexDirection: 'row',
        color: Colors.white,
        zIndex: -1,
        backgroundColor: Colors.primary
    },
    topNav: {
        color: Colors.white,
        marginTop: 25,
    },
    text: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    hoursOfOperationText: {
        color: 'black',
        marginLeft: 8,
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 16,
    },
    bottom: {
        height: 45,
    },
    buttonText: {
        flex: 1,
        borderRadius: 25,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        color: Colors.white,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
})
