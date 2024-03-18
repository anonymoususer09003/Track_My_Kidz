
export class EmailDTO {
  email: string = "";
}

export class UserRegistrationDTO {
  name?:string
  bio?: string = "";
  birthDate?: string = "";
  city?: string = "";
  country?: string = "";
  fbAccount?: string = "";
  firstname: string = "";
  gender?: string = "Male";
  instagramAccount?: string = "";
  lastname: string = "";
  password?: string = "";
  paypalAccount?: string = "";
  phone: string = "";
  phoneCountry?: string = "";
  privacyAgreement?: boolean = true;
  professional?: boolean = true;
  professionalLicenseNumber?: number = 0;
  registrationId?: string = "";
  school?: string = "";
  state?: string = "";
  term?: boolean = true;
  twitterAccount?: string = "";
  username?: string = "";
  websiteUrl?: string = "";
  address?: string = "";
  zipcode?: string = "";
  grades?: Array<Grade>;
  grade?: string = "";
  email: string = "";
  approve?: boolean = true;
  latitude?: number;
  longitude?: number;
  representatives?: [];
  isAdmin?: boolean = false;
  parentId?: number;
  orgId?: number;
  schoolId?: number;
  status?: string = "";
}
export class OrganisationInstructor {
  firstname: string = "";

  lastname: string = "";

  phone: string = "";

  email: string = "";

  isAdmin?: boolean = false;
}
export class RegisterDTO {
  password: string = "";
  email: string = "";
  activationcode: string = "";
}

export class Grade {
  id?: string;
  name: string = "";
  subject?: Subject | Subject[];
}

export class Subject {
  id?: string;
  name: string = "";
}

export class Instructor {
  firstName: string = "";
  lastName: string = "";
  email: string = "";
}

export class GetUserDTO {
  bio: string = "";
  birthDate: string = "";
  city: string = "";
  country: string = "";
  currency: string = "";
  createdOn: Date = new Date();
  email: string = "";
  fbAccount: string = "";
  firstName: string = "";
  followedByYou: boolean = false;
  gender: string = "";
  id: string = "";
  instagramAccount: string = "";
  language: number = 0;
  lastName: string = "";
  noFollowers: number = 0;
  noFollowing: number = 0;
  password: string = "";
  paymentCustomerSetup: boolean = false;
  paypalAccount: string = "";
  phone: string = "";
  phoneCountry: string = "";
  pictureUrl: string = "";
  privacyAgreement: boolean = false;
  privateAccount: boolean = false;
  productListingSubscriptionPaid: boolean = false;
  professional: boolean = false;
  professionalLicenseNumber: number = 0;
  professionalLicenseUrl: string = "";
  reviews: number = 0;
  role: string = "";
  schedulerSubscriptionPaid: boolean = false;
  school: string = "";
  state: string = "";
  termsConditions: boolean = false;
  twitterAccount: string = "";
  username: string = "";
  verifiedProfessional: boolean = false;
  websiteUrl: string = "";
  zoomUserId: string = "";
  latestNotificationChecked: number = 0;
}

export interface CurrentUserDTO {
  instagramAccount: string;
  twitterAccount: string;
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  zipcode: string;
  phone: string;
  country: string;
  currency: string;
  language: number;
  role: string;
  createdOn: Date;
  state: string;
  city: string;
  professional: boolean;
  school: string;
  websiteUrl: string;
  fbAccount: string;
  birthDate: string;
  gender: string;
  pictureUrl: string;
  verifiedProfessional: boolean;
  privateAccount: boolean;
  bio: string;
  noFollowing: number;
  noFollowers: number;
  reviews: number;
  followedByYou: boolean;
  schedulerSubscriptionPaid: boolean;
  productListingSubscriptionPaid: boolean;
  paymentCustomerSetup: boolean;
  zoomUserId: string;
  isTwoFA: boolean;
  isTwoFAConfirmed: boolean;
  showGiftModal: boolean;
  latestNotificationChecked: number;
  freeBoostCreditInUsd: number;
  serviceProvider: SchedulerDTO;
  schedulerSubscriptionActive: boolean;
  schoolId?: number;
  orgId: number;
  instructorId: number;
  studentId: number;
  childTrackHistory?: boolean;
}

export interface OpenDay {
  day: string;
  startHour: string;
  endHour: string;
}

export interface SpecificService {
  id: string;
  menuId: number;
  name: string;
  serviceTime: number;
}

export interface SchedulerDTO {
  id: string;
  openDays: OpenDay[];
  bufferMinutes: number;
  specificServices: SpecificService[];
  closedDates: Date[];
}

export interface AppointmentPostDto {
  specificServices: string[];
  appointmentTime: Date;
  note: string;
}

export interface PrivacyFollowersDTO {
  checked: boolean;
  user: GetUserDTO;
}
