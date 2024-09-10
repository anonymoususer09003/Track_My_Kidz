import { Text } from '@ui-kitten/components';
import React, { FC, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import * as yup from 'yup';
import Colors from '@/Theme/Colors';
import Icon from 'react-native-vector-icons/Entypo';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import moment from 'moment';
// import { useTheme } from "@/Theme";
import { Cell, Table, TableWrapper } from 'react-native-table-component';
import { FindInstructorBySchoolOrg, GetInstructor } from '@/Services/Instructor';
import { loadUserId } from '@/Storage/MainAppStorage';
import { AppHeader } from '@/Components';
import EditOrgInstructorsModal from '@/Modals/EditOrganizationInstructorModal';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

const height = Dimensions.get('screen').height;

type OrgInstructorListFormModalProps = {
  route: RouteProp<MainStackNavigatorParamsList, 'InstructorList'>;
};

const OrgInstructorListFormModal: FC<OrgInstructorListFormModalProps> = ({ route }) => {
  // const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [visible, setVisible] = useState<boolean>(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>({});
  const [rerender, setRerender] = useState<number>(0);
  const [userId, setUserId] = useState<number | string>(0);
  const [tableData, setTableData] = useState<any>({
    tableHead: ['First Name', 'Last Name', 'Email', 'Phone', 'Admin', ' '],
    tableData: [],
    item: [],
  });
  const [addEditVisible, setaddEditVisible] = useState<boolean>(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const shoppingListValidationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().required('Email is required'),
  });

  // const handleGetOrganizationInfo = async () => {
  //   const userId = await loadUserId();
  // };
  const getInstructor = async () => {
    const userId = await loadUserId();
    if (!userId) return;
    setUserId(userId);
    GetInstructor(userId)
      .then((res) => {
        // setUser(res);
        FindInstructorBySchoolOrg({
          schoolId: res?.schoolId,
          orgId: res?.orgId,
        })
          .then((instructors) => {
            let temp = { ...tableData };
            let row: any[] = [];
            let rowItem: any[] = [];
            instructors?.map((item: any, index: number) => {
              let { firstname, lastname, email, phone, isAdmin, state } = item;
              row.push([firstname, lastname, email, phone ? phone : '', isAdmin, state]);
              rowItem.push(item);
            });

            temp.tableData = row;
            temp.item = rowItem;
            setTableData(temp);
            setInstructors(instructors);
            // setOrgInfo(org);
          })
          .catch((err) => console.log(err));
      })

      .catch((err) => {
        console.log('Error:', err);
      });
  };
  const formatTableData = (data: any) => {
    let temp = { ...tableData };
    let row: any[] = [];
    let rowItem: any[] = [];
    data.map((item: any, index: number) => {
      let { firstname, lastname, email, phone, phoneNumber, isAdmin, state } = item;
      row.push([
        firstname,
        lastname,
        email,
        phone ? phone : phoneNumber ? phoneNumber : '',
        isAdmin,
        state,
      ]);
      rowItem.push(item);
    });

    temp.tableData = row;
    temp.item = rowItem;
    setTableData(temp);
    // console.log("data", data);

    setInstructors(data);
  };
  useEffect(() => {
    if (isFocused) {
      getInstructor();
    }
  }, [isFocused, rerender]);
  const elements = (index: number, data: any, item: any) => {
    switch (index) {
      case 4:
        return <Text style={{ fontSize: 13, marginLeft: 5 }}>{data ? 'Admin' : ' '}</Text>;
        break;
      default:
        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedInstructor(item);
              setVisible(true);
            }}
          >
            <Icon name="dots-three-vertical" size={15} />
          </TouchableOpacity>
        );
    }
  };
  return (
    <BackgroundLayout title="Instructors List">
      <AppHeader
        hideCalendar={true}
        hideApproval={true}
        onAddPress={() => {
          setaddEditVisible(true);
        }}
      />
      {addEditVisible && (
        <EditOrgInstructorsModal
          userId={userId}
          isAdd={true}
          orgInfo={route?.params?.data}
          visible={addEditVisible}
          setRerender={() => {
            setRerender(rerender + 1);
          }}
          setAdd={(item: any) => {
            let { firstName, lastName, ...others } = item;
            let schema = {
              firstname: firstName,
              lastname: lastName,
              ...others,
            };
            let temp = [...instructors];
            temp.push(schema);
            formatTableData(temp);
          }}
          setVisible={(value: any) => {
            setaddEditVisible(value);
          }}
          getInstructor={() => null}
        />
      )}
      <EditOrgInstructorsModal
        userId={userId}
        isEdit={true}
        // setRerender={() => setRerender(rerender + 1)}
        orgInfo={route?.params?.data}
        visible={visible}
        instructors={selectedInstructor}
        onEdit={(item: any) => {
          let { firstName, lastName, ...others } = item;
          let schema = {
            firstname: firstName,
            lastname: lastName,
            ...others,
          };
          let temp = [...instructors];

          // console.log("length=-------------", temp.result.length);
          let index = temp.findIndex(
            (item) => item?.instructorId == selectedInstructor.instructorId
          );
          let temValue = { ...temp[index] };
          temValue = schema;
          temp[index] = temValue;

          // console.log("temp", temp.result.length);

          formatTableData(temp);
          setVisible(false);
        }}
        setVisible={(value: any, id: number) => {
          let temp = [...instructors];
          setVisible(value);
          // console.log("length=-------------", temp.result.length);

          temp = instructors.filter((item) => item.instructorId != id);
          // console.log("temp", temp.result.length);

          formatTableData(temp);
          // setInstructors(temp);
        }}
        getInstructor={() => null}
      />

      <View
        style={{
          paddingRight: 19,

          backgroundColor: Colors.newBackgroundColor,
          flex: 1,
          borderRadius: 20,
        }}
      >
        <FlatList
          data={instructors}
          showsVerticalScrollIndicator={false}
          style={{
            padding: 10,
            width: '100%',
            marginTop: 10,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => {
            return (
              <View
                style={[
                  styles.item,
                  {
                    backgroundColor: '#fff',
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedInstructor(item);
                    setVisible(true);
                  }}
                >
                  {item?.isAdmin && <Text style={[styles.text, { fontWeight: 800 }]}>Admin</Text>}

                  <Text style={[styles.text, { fontWeight: 800 }]}>
                    {item?.firstname + ' ' + item?.lastname}
                  </Text>

                  <Text style={[styles.text]}>{item?.email}</Text>
                  <Text style={[styles.text]}>{item?.phone || ''}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </BackgroundLayout>
  );
};
export default OrgInstructorListFormModal;

const styles = StyleSheet.create({
  modal: {
    height: '100%',
    width: '100%',
    backgroundColor: 'red',
    // elevation: 5,
    shadowColor: Colors.primaryGray,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    borderRadius: 5,
    shadowRadius: 5,
    shadowOpacity: 0.3,
    zIndex: 166,

    // marginTop: "13%",
  },
  background: {
    flex: 1,
    color: Colors.white,
    zIndex: 1,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
    marginTop: 35,
  },

  heading: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '30%',
  },
  modalButton: {
    width: '95%',
    marginTop: 10,
  },
  selectInput: {
    marginTop: 10,
  },
  mainAsset: {
    alignItems: 'center',
    height: 300,
    width: '100%',
    flex: 3,
  },
  mainContent: {
    flex: 4,
  },
  textContent: {
    fontSize: 16,
    padding: 10,
    width: '100%',
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  extraImages: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: 100,
  },
  centerItems: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    fontSize: 10,
    color: 'red',
    marginBottom: 80,
  },
  formView: {
    flex: 9,
  },
  bottomView: {
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: Colors.transparent,
    bottom: 0,
    height: 50,
  },
  linearBottom: {
    width: '100%',

    height: 50,
  },
  createPostButton: {
    margin: 3,
    width: '50%',

    height: 50,
    right: 0,
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
  },
  ghostButton: {
    margin: 8,
    width: '100%',
    alignSelf: 'center',
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  formContainer: {
    flex: 1,
    marginVertical: 20,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  backgroundButton: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: 'bold',
    color: Colors.gray,
    textAlign: 'center',
  },
  selectSettings: {
    marginTop: 18,
  },
  tableHeadertext: {
    textAlign: 'center',
    margin: 6,
    color: Colors.white,
  },
  tableHeadertext0: {
    textAlign: 'center',
    margin: 6,
    color: Colors.black,
  },
  head0: {
    height: 50,
    padding: 5,
    backgroundColor: Colors.white,
    borderTopEndRadius: 5,
    borderBottomEndRadius: 5,

    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
  tableView: {
    marginTop: 70,
    marginBottom: 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    // marginBottom: 10,
    // borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  head: {
    height: 60,
    padding: 5,
    // width: 100,
    backgroundColor: Colors.primary,
  },
  floatButton: {
    marginTop: 20,
    alignSelf: 'flex-end',
    marginRight: 10,
    // position: "absolute",
    // bottom: 20,
    // right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
  footerText: {
    fontSize: 14,
    marginVertical: 2,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    fontSize: 14,
    marginVertical: 4,
  },
});
