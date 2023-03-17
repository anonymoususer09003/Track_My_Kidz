import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { LivestreamPostDTO } from "@/Models/LivestreamDTOs/livestream.interface";
import { PostGetDto } from "@/Models/PostDTOS/post.interface";

export default buildSlice("modal", [ChangeModalState], {
  welcomeMessageModal: false,
  imagePickerModal: false,
  dependentAddImport: false,
  parentPaymentModalVisibility: false,
  qrcodeModalVisibility: false,
  importDependentsModalVisibility: false,
  editDependentModalVisibility: false,
  instructionsModalVisibility: false,
  approveActivityModalVisibility: false,
  declineActivityModalVisibility: false,
  twoFactorAuthenticationModalVisibility: false,
  verifyYourselfModalVisibility: false,
  journeyTrackerModalVisibility: false,
  groupSelectionModalVisibility: false,
  showCalendar: false,
  loading: false,
  rollCallModalVisibility: false,
  requestPermissionModalVisibility: false,
  requestPermissionModalGroupVisibility: false,
  addInstructorModalVisibility: false,
  previewInstructorModalVisibility: false,
  addButInformationModalVisibility: false,
  previewButInformationModalVisibility: false,
  otherTrackingModal: false,
  setupVehicleModal: false,
  addStudentModal: false,
  addIndividualMemberModalVisibility: false,
  studentActivationCodeModal: false,
  addInstructorFormModalVisibility: false,
  editInstructorFormModalVisibility: false,
  studentVisibilityPermissionModal: false,
}).reducer;

export interface ModalState {
  welcomeMessageModal: boolean;
  dependentAddImport: boolean;
  parentPaymentModalVisibility: boolean;
  qrcodeModalVisibility: boolean;
  importDependentsModalVisibility: boolean;
  editDependentModalVisibility: boolean;
  instructionsModalVisibility: boolean;
  childrenSelectionModalVisibility: boolean;
  approveActivityModalVisibility: boolean;
  declineActivityModalVisibility: boolean;
  twoFactorAuthenticationModalVisibility: boolean;
  verifyYourselfModalVisibility: boolean;
  journeyTrackerModalVisibility: boolean;
  groupSelectionModalVisibility: boolean;
  showCalendar: boolean;
  loading: boolean;
  rollCallModalVisibility: boolean;
  requestPermissionModalVisibility: boolean;
  requestPermissionModalGroupVisibility: boolean;
  addInstructorModalVisibility: boolean;
  previewInstructorModalVisibility: boolean;
  addButInformationModalVisibility: boolean;
  previewButInformationModalVisibility: boolean;
  otherTrackingModal: boolean;
  setupVehicleModal: boolean;
  addStudentModal: boolean;
  addIndividualMemberModalVisibility: boolean;
  studentActivationCodeModal: boolean;
  addInstructorFormModalVisibility: boolean;
  editInstructorFormModalVisibility: boolean;
  studentVisibilityPermissionModal: boolean;
  imagePickerModal: boolean;
}
