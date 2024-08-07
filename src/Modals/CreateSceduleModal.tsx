import { CustomTextDropDown, LinearGradientButton } from '@/Components';

import Colors from '@/Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import {
  Card,
  CheckBox,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Text,
  Datepicker,
  Select,
  Divider,
} from '@ui-kitten/components';
import { actions } from '@/Context/state/Reducer';
import { useDispatch, useSelector } from 'react-redux';
import { TimeStampSelect } from '@/Components/TimeStampSelect/TimeStampSelect';
import CreateSchedule from '@/Services/Schedule/CreateSchedule';
import EditScheduleById from '@/Services/Schedule/EditScheduleById';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Alert } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as yup from 'yup';
import { TIME_STAMP, WEEK_DAYS } from '@/Constants';
import { Formik } from 'formik';
import { SubmitButton } from '@/Components/SubmitButton/SubmitButton';
import moment from 'moment';
import { useStateValue } from '@/Context/state/State';
const CreateScheduleModal = ({
  title,
  selectedScehdule,
  onSubmit,
}: {
  title: string;
  selectedScehdule: any;
  onSubmit: any;
}) => {
  const dispatch = useDispatch();
  const [{ selectedGroup: group }, _dispatch]: any = useStateValue();
  const timeStamp = TIME_STAMP;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [initialValues, setInitialValues] = useState<any>({
    eventName: '',
    venueName: '',
    eventAddress: '',
    date: '',
    time: '',
    eventType: 'competition',
  });
  const validationSchema = yup.object().shape({
    eventName: yup.string().required('Venue name is required'),
    venueName: yup.string().required('Venue name is required'),
    eventAddress: yup.string().required('Address is required'),
    date: yup.string().required('date is required'),
    time: yup.string().required('Time is required'),
  });
  const showCreateScheduleModal = useSelector(
    (state: { modal: ModalState }) => state.modal.showCreateScheduleModal
  );
  const closeModal = () => {
    dispatch(ChangeModalState.action({ showCreateScheduleModal: false }));
  };

  useEffect(() => {
    if (selectedScehdule) {
      const { eventName, venueName, venueAddress, date, time, isPractice } = selectedScehdule;
      setSelectedIndex(isPractice ? 2 : 0);
      setInitialValues({
        eventName,
        venueName,
        eventAddress: venueAddress,
        date: new Date(date),
        time,
        eventType: isPractice ? 'practice' : 'competition',
      });
    }
  }, [selectedScehdule]);

  return (
    <Modal
      style={styles.container}
      visible={showCreateScheduleModal}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        closeModal();
      }}
    >
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
        <Card style={styles.modal} disabled={true}>
          <View style={styles.body}>
            <View style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Formik
                // validateOnMount={true}
                enableReinitialize
                validationSchema={validationSchema}
                initialValues={initialValues}
                onSubmit={async (values, { resetForm }) => {
                  let formattedTime = moment(values.time, 'h:mma').format('HH:mm:ss');

                  let data = {
                    date: moment().format('YYYY-DD-MM'),
                    time: formattedTime,
                    eventName: values.eventName,
                    venueName: values.venueName,
                    venueAddress: values.eventAddress,
                    groupId: group,
                  };

                  try {
                    let res = selectedScehdule
                      ? await EditScheduleById(selectedScehdule.scheduleId, data)
                      : await CreateSchedule(values.eventType == 'competition' ? false : true, {
                          ...data,
                        });

                    onSubmit();
                    dispatch(ChangeModalState.action({ showCreateScheduleModal: false }));
                  } catch (err) {
                    console.log('err', err);
                  }
                }}
              >
                {({
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  values,
                  errors,
                  isValid,
                  resetForm,
                  touched,
                }) => (
                  <>
                    <Input
                      style={styles.textInput}
                      placeholder=" Event Name"
                      onChangeText={handleChange('eventName')}
                      value={values?.eventName}
                      label={(evaProps: any) => <Text style={styles.inputLabels}>Event name</Text>}
                    />
                    {errors.eventName && <Text style={styles.errorText}>{errors.eventName}</Text>}

                    <Input
                      style={styles.textInput}
                      placeholder=" Venue Name"
                      onChangeText={handleChange('venueName')}
                      value={values?.venueName}
                      label={(evaProps: any) => <Text style={styles.inputLabels}>Venue name</Text>}
                    />
                    {errors.venueName && <Text style={styles.errorText}>{errors.venueName}</Text>}
                    <Input
                      style={styles.textInput}
                      placeholder=" Event Address"
                      onChangeText={handleChange('eventAddress')}
                      value={values.eventAddress}
                      label={(evaProps: any) => (
                        <Text style={styles.inputLabels}>Event address</Text>
                      )}
                    />
                    {errors.eventAddress && (
                      <Text style={styles.errorText}>{errors.eventAddress}</Text>
                    )}

                    <Datepicker
                      min={new Date(1900, 0, 0)}
                      style={[styles.selectSettings]}
                      label={(evaProps: any) => <Text style={styles.inputLabels}>Event Date</Text>}
                      placeholder="Event Date"
                      date={values.date}
                      onSelect={(date: Date | null) => {
                        setFieldValue('date', date);
                      }}
                    >
                      <TextInput
                        value={values.date ? values.date.toLocaleDateString() : ''}
                        placeholder="Select date"
                        style={{
                          color: 'red',
                          backgroundColor: 'red',
                          width: 2,
                        }}
                        // onBlur={handleBlur('confirmPassword')}
                      />
                    </Datepicker>
                    {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

                    <Text style={[styles.inputLabels, { marginTop: 5, marginLeft: 20 }]}>Time</Text>
                    <CustomTextDropDown
                      value={values.time}
                      placeholder="Time"
                      dropDownList={timeStamp}
                      onSelect={(name: any) => {
                        setFieldValue('time', name);
                      }}
                    />
                    {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
                    {/* <Select
                            value={values.time}
style={styles.selectSettings}                            placeholder="Time"
                            onSelect={(index: any) => {
                              Alert.alert('akka')
                              console.log('time',timeStamp[index.row])
                              setFieldValue('time', timeStamp[index.row]);
                            }}
                            label={(evaProps: any) => (
                                <Text style={styles.inputLabels}>Time</Text>
                            )}
                          >
                            <TimeStampSelect timeStamp={timeStamp} />
                          </Select> */}

                    <RadioGroup
                      selectedIndex={selectedIndex}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '60%',
                      }}
                      onChange={(index) => {
                        setFieldValue('eventType', index == 0 ? 'competition' : 'practice');
                        setSelectedIndex(index);
                      }}
                    >
                      <Radio
                        appearance="default"
                        status="primary"
                        style={[
                          styles.radioButton,
                          {
                            borderColor: selectedIndex == 0 ? Colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {(evaProps) => (
                          <Text style={{ fontSize: 14, marginLeft: 10 }}> Competition</Text>
                        )}
                      </Radio>
                      <Divider />

                      <Radio
                        style={[
                          styles.radioButton,
                          {
                            borderColor: selectedIndex == 2 ? Colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {(evaProps) => (
                          <Text style={{ fontSize: 14, marginLeft: 10 }}>Practice</Text>
                        )}
                      </Radio>
                      <Divider />
                    </RadioGroup>
                    <View style={{ marginVertical: 10 }} />
                    <LinearGradientButton disabled={!isValid} onPress={handleSubmit}>
                      save
                    </LinearGradientButton>
                    <View style={{ marginVertical: 10 }} />
                    <LinearGradientButton onPress={closeModal}>close</LinearGradientButton>
                  </>
                )}
              </Formik>
            </View>
          </View>
        </Card>
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default CreateScheduleModal;

const styles = StyleSheet.create({
  container: {
    maxHeight: 600,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  inputSettings: {
    marginTop: 7,
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },

  textInput: {
    marginTop: 10,
    alignSelf: 'center',
    width: '95%',
    marginLeft: '5%',
    borderRadius: 8,
    elevation: 2,
  },

  inputLabels: {
    color: Colors.black,
    fontSize: 14,

    // marginBottom: 10,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  radioButton: {
    width: '70%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingLeft: 10,
    marginLeft: '10%',
  },

  errorText: {
    fontSize: 13,
    color: 'red',
    marginLeft: 20,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  selectSettings: {
    width: '95%',
    marginLeft: '5%',
    marginTop: 10,
    alignSelf: 'center',
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 20,
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
