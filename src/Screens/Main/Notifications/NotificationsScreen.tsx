import {StyleSheet, View} from "react-native";
import {AppHeader} from "@/Components";
import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {NotificationsState} from "@/Store/Notifications";
import {Divider, Icon, List, ListItem, Spinner, Text} from "@ui-kitten/components";
import {UpdateUnreadCount} from "@/Services/Notifications";
import FetchUnreadCount from "@/Store/Notifications/FetchUnreadCount";
import {format, getDate} from "date-fns";
import Colors from "@/Theme/Colors";


const NotificationsScreen = () => {
    const notifications = useSelector((state: { notifications: NotificationsState }) => state.notifications.notifications)
    const unReadCount = useSelector((state: { notifications: NotificationsState }) => state.notifications.unreadCount)
    const notificationsLoading = useSelector((state: { notifications: NotificationsState }) => state.notifications.notificationsState.loading)

    function getTitle(operation: string) {
        switch (operation) {
            // case "POST_LIKE":
            //     return "Post Like";
            case "BLOG_COMMENT":
                return "Blog Comment";
            // case "COMMENT_LIKE":
            //     return "Comment Like";
            case "USER_FOLLOWING":
                return "New Follower";
            // case "BLOG_LIKE":
            //     return "Blog Like";
            // case "CLASS_LIKE":
            //     return "Class Like";
            case "POST_COMMENT":
                return "Post Comment";
            case "CLASS_COMMENT":
                return "Class Comment";
        }
    }

    const dispatch = useDispatch()
    useEffect(() => {
        setTimeout(()=>{
            if (notifications && notifications.length > 0 && notifications[0]) {
                UpdateUnreadCount(notifications[0].id).then(data=>{
                    dispatch(FetchUnreadCount.action())
                })
            }
        },5000)

    }, [])

    const renderItemIcon = (props, index) => {
        if (notifications.length - (index + 1) < unReadCount.latest) {
            return <Icon {...props} style={[props.style, {padding: 5, marginRight: 15}]} name='bell'/>
        } else {
            return <Icon {...props} style={[props.style, {padding: 5, marginRight: 15}]} name='bell-outline'/>

        }
    }
    const renderDate = (props, item) => {
        const strSplitDate = String(item.operationDate);
        const date = new Date(strSplitDate);
        return isToday(date) ? (<Text>{format(date, "'Today at' HH:mm")}</Text>) : (<Text>{format(date, "dd MMM yyyy 'at' HH:mm")}</Text>)
    }

    const isToday = (someDate) => {
        const today = new Date()
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()
    }

    const NotificationItem = ({item, index}) => (
        <ListItem
            title={() => (<Text>{getTitle(item.operation)}</Text>)}
            description={() => (<Text>{item.message}</Text>)}
            accessoryLeft={(props) => renderItemIcon(props, index)}
            accessoryRight={(props)=>renderDate(props,item)}

            style={{
                backgroundColor: notifications.length - (index + 1) < unReadCount.latest ? Colors.primaryTint : Colors.white
            }}
            key={index}
        />
    );
    return (
        <>
            <AppHeader title="Notifications"/>
            {notificationsLoading && <Spinner status='primary'/>}
            {!notificationsLoading && (
                <View>
                    <List
                        data={notifications}
                        ItemSeparatorComponent={Divider}
                        renderItem={({item, index}) => <NotificationItem item={item} index={index}/>}
                    />
                    {notifications && notifications.length === 0 && (
                        <Text style={{marginTop: 30, alignSelf: 'center'}}>No notifications yet</Text>
                    )}
                </View>)}
        </>
    )
}

export default NotificationsScreen


const styles = StyleSheet.create({
    layout: {
        flex: 1,
        flexDirection: 'column',
    },
    mainLayout: {
        flex: 9,
        marginTop: 40,
    },
})
