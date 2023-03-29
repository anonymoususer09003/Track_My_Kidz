import { createAction } from "@reduxjs/toolkit";
import { ModalState } from "@/Store/Modal";

interface PayloadInterface {
  payload: Partial<ModalState>;
}

export default {
  initialState: {},
  action: createAction<Partial<ModalState>>("modal/changeModalState"),
  reducers(state: ModalState, { payload }: PayloadInterface) {
    if (typeof payload.welcomeMessageModal !== "undefined") {
      state.welcomeMessageModal = payload.welcomeMessageModal;
    }
    if (typeof payload.imagePickerModal !== "undefined") {
      state.imagePickerModal = payload.imagePickerModal;
    }
    if (typeof payload.dependentAddImport !== "undefined") {
      state.dependentAddImport = payload.dependentAddImport;
    }
    if (typeof payload.parentPaymentModalVisibility !== "undefined") {
      state.parentPaymentModalVisibility = payload.parentPaymentModalVisibility;
    }
    if (typeof payload.qrcodeModalVisibility !== "undefined") {
      state.qrcodeModalVisibility = payload.qrcodeModalVisibility;
    }
    if (typeof payload.importDependentsModalVisibility !== "undefined") {
      state.importDependentsModalVisibility =
        payload.importDependentsModalVisibility;
    }
    if (typeof payload.editDependentModalVisibility !== "undefined") {
      state.editDependentModalVisibility = payload.editDependentModalVisibility;
    }
    if (typeof payload.instructionsModalVisibility !== "undefined") {
      state.instructionsModalVisibility = payload.instructionsModalVisibility;
    }
    if (typeof payload.childrenSelectionModalVisibility !== "undefined") {
      state.childrenSelectionModalVisibility =
        payload.childrenSelectionModalVisibility;
    }
    if (typeof payload.approveActivityModalVisibility !== "undefined") {
      state.approveActivityModalVisibility =
        payload.approveActivityModalVisibility;
    }
    if (typeof payload.declineActivityModalVisibility !== "undefined") {
      state.declineActivityModalVisibility =
        payload.declineActivityModalVisibility;
    }
    if (typeof payload.twoFactorAuthenticationModalVisibility !== "undefined") {
      state.twoFactorAuthenticationModalVisibility =
        payload.twoFactorAuthenticationModalVisibility;
    }
    if (typeof payload.verifyYourselfModalVisibility !== "undefined") {
      state.verifyYourselfModalVisibility =
        payload.verifyYourselfModalVisibility;
    }
    if (typeof payload.journeyTrackerModalVisibility !== "undefined") {
      state.journeyTrackerModalVisibility =
        payload.journeyTrackerModalVisibility;
    }
    if (typeof payload.groupSelectionModalVisibility !== "undefined") {
      state.groupSelectionModalVisibility =
        payload.groupSelectionModalVisibility;
    }
    if (typeof payload.showCalendar !== "undefined") {
      state.showCalendar = payload.showCalendar;
    }
    if (typeof payload.loading !== "undefined") {
      state.loading = payload.loading;
    }
    if (typeof payload.rollCallModalVisibility !== "undefined") {
      state.rollCallModalVisibility = payload.rollCallModalVisibility;
    }
    if (typeof payload.requestPermissionModalVisibility !== "undefined") {
      state.requestPermissionModalVisibility =
        payload.requestPermissionModalVisibility;
    }
    if (typeof payload.requestPermissionModalGroupVisibility !== "undefined") {
      state.requestPermissionModalGroupVisibility =
        payload.requestPermissionModalGroupVisibility;
    }
    if (typeof payload.addInstructorModalVisibility !== "undefined") {
      state.addInstructorModalVisibility = payload.addInstructorModalVisibility;
    }
    if (typeof payload.previewInstructorModalVisibility !== "undefined") {
      state.previewInstructorModalVisibility =
        payload.previewInstructorModalVisibility;
    }
    if (typeof payload.addButInformationModalVisibility !== "undefined") {
      state.addButInformationModalVisibility =
        payload.addButInformationModalVisibility;
    }
    if (typeof payload.previewButInformationModalVisibility !== "undefined") {
      state.previewButInformationModalVisibility =
        payload.previewButInformationModalVisibility;
    }
    if (typeof payload.otherTrackingModal !== "undefined") {
      state.otherTrackingModal = payload.otherTrackingModal;
    }
    if (typeof payload.setupVehicleModal !== "undefined") {
      state.setupVehicleModal = payload.setupVehicleModal;
    }
    if (typeof payload.addStudentModal !== "undefined") {
      state.addStudentModal = payload.addStudentModal;
    }
    if (typeof payload.addIndividualMemberModalVisibility !== "undefined") {
      state.addIndividualMemberModalVisibility =
        payload.addIndividualMemberModalVisibility;
    }
    if (typeof payload.studentActivationCodeModal !== "undefined") {
      state.studentActivationCodeModal = payload.studentActivationCodeModal;
    }
    if (typeof payload.addInstructorFormModalVisibility !== "undefined") {
      state.addInstructorFormModalVisibility =
        payload.addInstructorFormModalVisibility;
    }
    if (typeof payload.editInstructorFormModalVisibility !== "undefined") {
      state.editInstructorFormModalVisibility =
        payload.editInstructorFormModalVisibility;
    }
    if (typeof payload.studentVisibilityPermissionModal !== "undefined") {
      state.studentVisibilityPermissionModal =
        payload.studentVisibilityPermissionModal;
    }
    if (typeof payload.viewBusInformationModal !== "undefined") {
      state.viewBusInformationModal = payload.viewBusInformationModal;
    }
  },
};
