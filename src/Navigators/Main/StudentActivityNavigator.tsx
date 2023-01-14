import React, {useState} from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { Button, TabBar, } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { StudentGroupScreen, StudentActivityScreen } from "@/Screens";
import { AppHeader } from "@/Components";
import Colors from '@/Theme/Colors'
import moment from 'moment'
import { ModalState } from '@/Store/Modal'
import { useSelector } from 'react-redux'
import { Calendar } from '@/Components';

// @refresh reset
const StudentActivityNavigator = () => {
    const TabNavigator = createMaterialTopTabNavigator()
    const tabNames = ['Activity', 'Group']
    const [selectedMonth, setSelectedMonth] = useState(moment(new Date()).month());
    const [selectedDay, setSelectedDay] = useState(moment(new Date()).day());

    const isCalendarVisible = useSelector(
        (state: { modal: ModalState }) =>
            state.modal.showCalendar,
    )
    //@ts-ignore
    const TopTabBar = ({ navigation, state }) => (
        <TabBar
            selectedIndex={state.index}

            indicatorStyle={{ display: 'none' }}
            onSelect={index => navigation.navigate(state.routeNames[index])}
        >
            {tabNames.map((tabName, index) => {
                if (state.index == index) {
                    return (
                        <Button
                            key={index}
                            style={[
                                styles.buttonText,
                                styles.background,
                                { backgroundColor: Colors.lightgray },
                            ]}
                            appearance="ghost"
                            size="small"
                            status="primary"
                        >
                            {tabName}
                        </Button>
                    )
                } else {
                    return (
                        <View
                            key={index}
                            style={styles.background}
                        >
                            <Button
                                style={styles.buttonText}
                                appearance="ghost"
                                size="small"
                                status="control"
                                onPress={() => navigation.navigate(state.routeNames[index])}
                            >
                                {tabName}
                            </Button>
                        </View>
                    )
                }
            })}
        </TabBar>
    )
    return (
        <>
            <AppHeader title={`Activities & Groups`} />
            {isCalendarVisible && (
                <Calendar
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                />
            )}
            <TabNavigator.Navigator screenOptions={{ lazy: true, swipeEnabled: false }}
                tabBar={props => <TopTabBar {...props} />}>
                <TabNavigator.Screen
                    name="StudentActivity"
                    options={{ title: 'Activity' }}
                    component={StudentActivityScreen}
                />
                <TabNavigator.Screen
                    name="StudentGroup"
                    options={{ title: 'Groups' }}
                    component={StudentGroupScreen}
                />
            </TabNavigator.Navigator>
        </>
    )
}

export default StudentActivityNavigator
const styles = StyleSheet.create({
    background: {
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
    text: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    buttonText: {
        borderRadius: 10,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        color: Colors.white,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        justifyContent: 'center',
        alignItems: 'center',
    },
})
