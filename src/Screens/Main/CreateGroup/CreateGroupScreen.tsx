import React, { FC, useEffect, useState } from 'react';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { Input, Text } from '@ui-kitten/components';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';
import { Formik } from 'formik';
import { LinearGradientButton } from '@/Components';
import { useStateValue } from '@/Context/state/State';
import { actions } from '@/Context/state/Reducer';
import { GetGroup, GetOptInGroup } from '@/Services/Group';
import * as yup from 'yup';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

type CreateGroupScreenProps = {
  route: RouteProp<MainStackNavigatorParamsList, 'CreateGroup'>
}
const CreateGroupScreen: FC<CreateGroupScreenProps> = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  const [, _dispatch] : any= useStateValue();
  const dispatch = useDispatch();
  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const [groupDetail, setGroupDetail] = useState<any>({});
  const ValidationSchema = yup.object().shape({
    name: yup.string().min(3).max(20).required('Name is required'),
  });
  const [infomation, setInformation] = useState<any>({});
  const getGroupsOptInDetail = async () => {
    try {
      let res = await GetOptInGroup(route?.params?.data?.groupId);
      setInformation({ ...res, groupName: route?.params?.data?.groupName });
    } catch (err) {
      console.log('err', err);
    }
  };

  const getGroupDetail = async () => {
    GetGroup(route?.params?.data?.groupId)
      .then((res) => {
        console.log('groupinfo', res);

        let students = res?.studentsGroupList?.map((item: any) => ({
          name: item?.firstName + ' ' + item.lastName,

          parent1_email: item.parentEmail1,
          parent2_email: item.parentEmail2,
          studentId: item?.studentsGroupId,
        }));
        let instructors = res?.instructorsGroupList?.map((item: any, index: number) => ({
          firstname: item?.firstName,
          lastname: item?.lastName,
          email: item?.email,
          instructorId: item?.instructorGroupId,
          isEdit: true,
        }));
        console.log('instructors', instructors);
        setGroupDetail({ instructors, students });
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  useEffect(() => {
    if (isFocused && route?.params) {
      getGroupsOptInDetail();
      getGroupDetail();
    } else {
      setInformation({});
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);
  console.log('9099090099099', infomation);
  return (
    <BackgroundLayout title="Create Group">
      <ScrollView style={styles.layout}>
        <View>
          <Text
            textBreakStrategy={'highQuality'}
            style={{
              textAlign: 'center',
              color: '#606060',
              fontSize: 18,
            }}
          >
            Create a name for your Group
          </Text>
          <Formik
            enableReinitialize
            validationSchema={ValidationSchema}
            // validateOnMount={true}
            initialValues={{
              name: infomation?.groupName || '',
              instructions: infomation?.instructions || '',
              disclaimer: infomation?.disclaimer || '',
              agreement: infomation?.agreement || '',
            }}
            onSubmit={(values, { resetForm }) => {
              const data = {
                name: values.name,
                optin: {
                  instructions: values.instructions,
                  disclaimer: values.disclaimer,
                  agreement: values.agreement,
                  status: true,
                },
                isEdit: route?.params
                  ? { ...route?.params?.data, ...groupDetail }
                  : false,
              };
              _dispatch({
                type: actions.SET_GROUP,
                payload: data,
              });

              navigation.navigate('AddMembers', {
                isEdit: !!route?.params,
                data: { ...route?.params?.data, ...groupDetail },
              });
              resetForm();
            }}
          >
            {({
                handleChange,
                handleSubmit,
                values,
                errors,
                isValid,
                touched,
                handleBlur,
              }) => (
              <>
                <View style={styles.formContainer}>
                  <Input
                    style={styles.textInput}
                    textStyle={{ minHeight: 30, textAlignVertical: 'center' }}
                    placeholder="Group name*"
                    onBlur={handleBlur('name')}
                    onChangeText={handleChange('name')}
                    value={values.name}
                  />
                  {errors.name && touched.name ? (
                    <Text style={styles.errorText}>{String(errors.name)}</Text>
                  ) : null}
                  <Input
                    style={styles.textArea}
                    textStyle={{ minHeight: 70, textAlignVertical: 'top' }}
                    placeholder="Instructions"
                    onChangeText={handleChange('instructions')}
                    value={values.instructions}
                    multiline={true}
                    maxLength={500}
                  />
                  <Input
                    style={styles.textArea}
                    textStyle={{ minHeight: 70, textAlignVertical: 'top' }}
                    placeholder="Disclaimer"
                    onChangeText={handleChange('disclaimer')}
                    value={values.disclaimer}
                    multiline={true}
                    maxLength={500}
                  />
                  <Input
                    style={styles.textArea}
                    textStyle={{ minHeight: 70 }}
                    placeholder="Agreement"
                    onChangeText={handleChange('agreement')}
                    value={values.agreement}
                    multiline={true}
                    maxLength={500}
                  />

                  <View style={styles.buttonSettings}>
                    <LinearGradientButton
                      disabled={!isValid}
                      onPress={handleSubmit}
                    >
                      {route?.params ? 'Edit Members' : 'Add Members'}
                    </LinearGradientButton>
                  </View>
                </View>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </BackgroundLayout>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 20,
    backgroundColor: Colors.newBackgroundColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sent: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  background: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    alignSelf: 'center',
  },
  textInput: {
    marginTop: 10,
    alignSelf: 'center',
    width: '95%',
    // marginLeft: "5%",
    borderRadius: 8,
    elevation: 2,
  },
  textArea: {
    marginTop: 10,

    borderRadius: 10,
    elevation: 2,
    width: '95%',
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 10,
    color: 'red',
    marginLeft: 20,
    marginTop: 10,
  },
  LinearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 20,
    width: '90%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
