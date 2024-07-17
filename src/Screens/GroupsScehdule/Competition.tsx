import React, { FC, useEffect, useRef, useState } from 'react';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Text } from '@ui-kitten/components';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import setHeaderParams from '@/Store/header/setHeaderParams';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStateValue } from '@/Context/state/State';
import { useDispatch, useSelector } from 'react-redux';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Colors from '@/Theme/Colors';
import { actions } from '@/Context/state/Reducer';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ModalState } from '@/Store/Modal';
import { UserTypeState } from '@/Store/UserType';
import { AppHeader } from '@/Components';
import SetChatParam from '@/Store/chat/SetChatParams';
import GetScheduleByGroupId from '@/Services/Schedule/GetScheduleByGroupId';
// import { useDebouncedEffect } from '@/Utils/Hooks';

import axios from 'axios';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import { InstructorActivityNavigatorParamList } from '@/Navigators/Main/InstructorActivityNavigator';
import { UserState } from '@/Store/User';

import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { DeleteScehdule,CreateScheduleModal } from '@/Modals';
import DeleteScheduleById from '@/Services/Schedule/DeleteScheduleById';
import DeleteScheduleByGroupId from '@/Services/Schedule/DeleteScheduleByGroupId';


type CompetitionScreenProps = {
  route: RouteProp<InstructorActivityNavigatorParamList, 'InstructorGroup'>;
};

const CompetitionScreen: FC<CompetitionScreenProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  // const swipeableRef = useRef(null);
  const [user, setUser] = useState<any>(null);
  const currentUser: any = useSelector(
    (state: { user: UserState }) => state.user.item,
  );
  const [selectedScehduleItem,setSelectedScehdule]=useState<any>(null);
  const deleteAllSchedules = useSelector(
    (state: { modal: ModalState }) => state.modal.deleteAllSchedules,
  );
  const [page, pageNumber] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [{  selectedSchedule},]: any = useStateValue();
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const [competitions, setCompetitions] = useState<any | any>([]);
  const [originalCompetitions, setOriginalCompetitions] =  useState<any | any>([]);
  const [, _dispatch]: any = useStateValue();
  const dispatch = useDispatch();
 const showCreateScheduleModal = useSelector(
    (state: { modal: ModalState }) => state.modal.showCreateScheduleModal,
  );
  const showDeleteScheduleModal = useSelector(
    (state: { modal: ModalState }) => state.modal.showDeleteScheduleModal,
  );
  const[resetAll,setResetAll]=useState(true)
  const searchBarValue = useSelector(
    (state: any) => state.header.searchBarValue,
  );
  const [{ selectedGroup: group }]: any = useStateValue();
  const dropDownValue = useSelector((state: any) => state.header.dropDownValue);
  const [initialize, setInitialize] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
 const[showDeleteScehdule,setDeleteSchedule]=useState(false)
  const [searchParam, setSearchParam] = useState<string>('');
  // const [selectedDependent, setSelectedDependent] = useState(null);

  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType,
  );




 
  let prevOpenedRow: any;
  let row: Array<any> = [];

 


  const handleDeleteModal=()=>{
 if(showDeleteScheduleModal)
 {              dispatch(ChangeModalState.action({showDeleteScheduleModal: false,deleteAllSchedules:false }));}
  
  else{
    dispatch(ChangeModalState.action({showDeleteScheduleModal: true,deleteAllSchedules:false }));}
  }

  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

   return (
      <>
  
     <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
         
     
      
          <TouchableOpacity
            onPress={() => {
              prevOpenedRow?.close();
              _dispatch({
                type: actions.SET_SELECTED_SCHEDULE,
                payload: {...item,isPractice:false},
              });
              setSelectedScehdule({...item,isPractice:false})
              dispatch(ChangeModalState.action({showCreateScheduleModal: true }));
            }}
            style={{
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              style={{ width: 25, height: 25 }}
              fill={Colors.primary}
              name="edit-2"
            />
          </TouchableOpacity>
        
        </View>


   
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() =>
                {
                  prevOpenedRow?.close();
                 
                _dispatch({
                  type: actions.SET_SELECTED_SCHEDULE,
                  payload: {...item,isPractice:false},
                });
               handleDeleteModal()
              }
              }
            >
              <Icon
                style={{ width: 30, height: 30 }}
                fill={Colors.primary}
                name="trash"
              />
            </TouchableOpacity>
          </View>
        
      </View>
      </>
    );
  };


  // useDebouncedEffect(
  //   () => {
  //     if (
  //       searchBarValue &&
  //       (searchBarValue.length === 0 || searchBarValue.length > 3)
  //     ) {
  //       search();
  //     } else if (searchBarValue == '' && initialize) {
  //       if (user?.isAdmin) {
  //       //   getGroups();
  //       getCompetitions(false)
  //       } else {
  //         getCompetitions(false,searchBarValue)
  //       //   getGroupsByUserId();
  //       }
  //     }
  //   },
  //   [searchBarValue],
  //   50,
  // );

  const search = (text: String) => {


  let  allCompetitions = originalCompetitions.filter((item: any, index: number) =>
      item.eventName.toLowerCase().includes(text.toLowerCase()),
    );
    setCompetitions(allCompetitions);
  };
useEffect(()=>{
 
if(searchBarValue)
{
  search(searchBarValue)
}
else{

  setCompetitions([...originalCompetitions])
}
},[searchBarValue])
 
  const closeRow = (index: number) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow?.close();
    }
    prevOpenedRow = row[index];
  };


//   useEffect(() => {
//     if (isFocused) {
//       getInstructor();
//     } else {
//       dispatch(
//         setHeaderParams.action({
//           selectedDropDownOption: '',
//           searchBarValue: '',
//         }),
//       );
//     }
//     return () => source.cancel('axios request cancelled');
//     //  abortControllerRef.current.abort();
//   }, [isFocused]);

//   useEffect(() => {
//     if (dropDownValue) {
//       if (dropDownValue.row === 0) {
//         setSelectedInstructor(null);
//         setSelectedInstructorGroup(null);
//       } else {
//         setSelectedInstructor(
//           instructors?.result[dropDownValue.row - 1]?.firstname +
//           ' ' +
//           instructors?.result[dropDownValue.row - 1]?.lastname,
//         );

//         getGroupByInstructor(
//           instructors?.result[dropDownValue.row]?.instructorId,
//         );
//       }
//     }
//   }, [dropDownValue]);
//   useEffect(() => {
//     if (searchBarValue) {
//       search(searchBarValue);
//     }
//   }, [searchBarValue]);
useEffect(()=>{
 
    // _dispatch({
    //   type: actions.SET_SELECTED_SCHEDULE,
    //   payload: null
    // });

getCompetitions()
  
},[showCreateScheduleModal])
// useEffect(()=>{
//   if(resetAll)
//   {

   
//     _dispatch({
//       type: actions.SET_SELECTED_SCHEDULE,
//       payload: null
//     });
// // getCompetitions()
// setResetAll(false)
//   }
// },[resetAll])

const getCompetitions = async (refreshing?: any,searchString?:any) => {
 try{
  console.log('-------297')
  if (refreshing) {
    setRefreshing(true);
  }
  // Alert.alert("kjk");
 let res=await GetScheduleByGroupId({groupId:group,isPractice:false,page_number:refreshing ?  page: 0, page_size:pageSize,sort:'DATE',searchString})
  
  


console.log('res0---',res)

      setRefreshing(false);
      setPageSize(pageSize);

      pageNumber(refreshing ? page + 1 : 1);
      setTotalRecords(res.totalElements);

      const data = res && res.content;
     
      // res.result
      //   .map((item) => ({
      //     ...item,
      //     // scheduler: {
      //     //   fromDate: item.scheduler.fromDate,
      //     //   status: item.scheduler.enabled,
      //     //   toDate: item.scheduler.toDate,
      //     // },
      //   }))
      //   .sort((a, b) => b.date - a.date);
      // console.log("data", data);
      if (refreshing) {
        setCompetitions(
       [...data, competitions],
        );
        setOriginalCompetitions( [...data, ...originalCompetitions],
        );
      } else {
        setCompetitions(
          data,
        );
        setOriginalCompetitions( data,
        );
      }
      setRefreshing(false)
          _dispatch({
      type: actions.SET_SELECTED_SCHEDULE,
      payload: null
    });
 }
 catch(err)
 {
    setRefreshing(false);
      setPageSize(pageSize);

      pageNumber(page);
      console.log('getActivities Error:', err);

 }
    // .catch((err) => {
    //   setRefreshing(false);
    //   setPageSize(pageSize);

    //   pageNumber(page);
    //   console.log('getActivities Error:', err);
    // });
};
console.log('group',group)
const handleDelete=async()=>{
  try{
console.log('original competitions',originalCompetitions)
  
  let res= deleteAllSchedules? await DeleteScheduleByGroupId(group,false): await DeleteScheduleById(selectedSchedule.scheduleId)  

  _dispatch({
    type: actions.SET_SELECTED_SCHEDULE,
    payload: null,
  });
  if(deleteAllSchedules)
  {
setOriginalCompetitions([])
setCompetitions([])
  }
  else{

  
  let filterArr=originalCompetitions.filter((item:any)=>item?.scheduleId!=selectedSchedule.scheduleId)
  setCompetitions(filterArr)
  setOriginalCompetitions(filterArr)
  }
  // setResetAll(true)
  handleDeleteModal()
}
  catch(err)
  {
    console.log('err',err)
  }

}
  return (
    <>
    <DeleteScehdule hide={()=>handleDeleteModal()} visible={showDeleteScheduleModal} onSubmit={()=>handleDelete()} title={'competition'}/>
  { showCreateScheduleModal&& <CreateScheduleModal selectedScehdule={selectedScehduleItem}   onSubmit={async()=>{
      setSelectedScehdule(null)
      setRefreshing(true)

   await   getCompetitions(false)
    }} title={'competition'}/>
  }
  
      <View style={styles.layout}>
        {/* {groups.length == 0 && (
          <Text style={{ textAlign: 'center', marginTop: 5 }}>
            You currently do not have any groups
          </Text>
        )} */}
        <FlatList
          data={
competitions
          }
          style={{
            padding: 10,
            width: '100%',
            marginTop: 10,
            marginBottom: 20,
          }}
          keyExtractor={item => item.scheduleId}
          renderItem={({ item, index }) => {
          
           
            return (
              <Swipeable
              enabled={user_type==='instructor'?true:false}
                ref={(ref) => (row[index] = ref)}
                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <View
                  style={[
                    styles.item,
                    {
                      backgroundColor: '#fff',
                    //   marginBottom: index + 1 == groups.length ? 50 : 0,
                    },
                  ]}
                >
                    <View style={styles.row}>
                    <Text
                    style={[
                      styles.text,
                      {
                        fontSize: 20,
                  
                        paddingLeft: 25,
                      },
                    ]}
                  >{item?.eventName}</Text>
           <Text
                    style={[
                      styles.text,
                      {
                        fontSize: 20,
                  
                        paddingRight: 25,
                      },
                    ]}
                  >{item?.date}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text
                    style={[
                      styles.text,
                      {
                        fontSize: 20,
                       
                        paddingLeft: 25,
                      },
                    ]}
                  >{item?.venueName}</Text>
           <Text
                    style={[
                      styles.text,
                      {
                        fontSize: 20,
                      
                        paddingRight: 25,
                      },
                    ]}
                  >{item.time}</Text>
                  </View>
                  {/* <Text style={styles.text}>{`Status: ${
                    item?.status ? "Active" : "Inactive"
                  }`}</Text> */}

                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: 20,
               
                        paddingLeft: 25,
                      },
                    ]}
                  >{item.venueAddress}</Text>
                   
                 

                
                </View>
              </Swipeable>
            );
          }}
          onEndReached={async () => {
            // console.log("logs", originalActivities.result.length);

           
            // if (totalRecords > competitions?.length) {
            //   console.log('logs');
            //   getCompetitions(true)
            //   // const userId = await loadUserId();

            // //   user?.isAdmin ? getGroups(true) : getGroupsByUserId(userId);
            // }
          }}
          refreshing={true}
          // onRefresh={() => null}
        />
        {refreshing && (
          <ActivityIndicator size="large" color={Colors.primary} />
        )}
      </View>

      <AppHeader

scehdule={true}
hideCalendar={true}
hideApproval={true}
      hideCenterIcon={user_type==='instructor'?false:true}
        onAddPress={() => {
          dispatch(ChangeModalState.action({showCreateScheduleModal: true }));
        }}
      />
    </>
  );
};

export default CompetitionScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 15,
    width: '96%',
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: '2%',
    // paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 140,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"space-between"
  },
  text: {
    fontSize: 13,
    marginVertical: 4,
  },


  
});
