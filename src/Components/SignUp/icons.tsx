import React from "react";
import { Image } from "react-native";
import { Icon, IconElement } from "@ui-kitten/components";

const userIcon = require("@/Assets/Images/approval_icon2.png");
const markerIcon = require("@/Assets/Images/marker.png");
const phoneIcon = require("@/Assets/Images/phone.png");
export const EmailIcon = (style: any): IconElement => (
  <Icon {...style} name="email" />
);

export const PersonIcon = (style: any): IconElement => (
  <Image source={userIcon} style={{ height: 17, width: 17, marginRight: 10 }} />
);
export const LocationIcon = (style: any): IconElement => (
  <Image
    source={markerIcon}
    style={{ height: 17, width: 17, marginRight: 10 }}
  />
);

export const InstagramIcon = (style: any): IconElement => (
  <Icon {...style} name="instagram" pack="feather" />
);

export const PlusIcon = (style: any): IconElement => (
  <Icon {...style} name="plus" />
);

export const PhoneIcon = (style: any): IconElement => (
  <Image
    source={phoneIcon}
    style={{ height: 17, width: 17, marginRight: 10 }}
  />
);

export const TwitterIcon = (style: any): IconElement => (
  <Icon {...style} name="twitter-outline" />
);

export const FacebookIcon = (style: any): IconElement => (
  <Icon {...style} name="facebook-outline" />
);

export const CalendarIcon = (props: any) => <Icon {...props} name="calendar" />;

export const PaypalIcon = (style: any): IconElement => (
  <Icon {...style} name="credit-card-outline" />
);

export const WebsiteIcon = (style: any): IconElement => (
  <Icon {...style} name="globe-outline" />
);
