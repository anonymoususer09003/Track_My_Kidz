export const USER_TYPES = [
  { id: 1, label: 'Parent', value: 'Parent' },
  { id: 2, label: 'Instructor', value: 'Instructor' },
  { id: 3, label: 'Student', value: 'Student' },
];

export const ORGANISATIONS = [
  { id: 1, label: 'School', value: 'School' },
  { id: 2, label: 'Organisation', value: 'Organisation' },
];

export const WEEK_DAYS = [
  {
    id: 1,
    name: 'Mon',
    selected: false,
  },
  {
    id: 1,
    name: 'Tue',
    selected: false,
  },
  {
    id: 1,
    name: 'Wed',
    selected: false,
  },
  {
    id: 1,
    name: 'Thu',
    selected: false,
  },
  {
    id: 1,
    name: 'Fri',
    selected: false,
  },
  {
    id: 1,
    name: 'Sat',
    selected: false,
  },
  {
    id: 1,
    name: 'Sun',
    selected: false,
  },
];


export const TIME_STAMP = [
  { id: 1, name: '7:00 AM' },
  { id: 2, name: '7:30 AM' },
  { id: 3, name: '8:00 AM' },
  { id: 4, name: '8:30 AM' },
  { id: 5, name: '9:00 AM' },
  { id: 6, name: '9:30 AM' },
  { id: 7, name: '10:00 AM' },
  { id: 8, name: '10:30 AM' },
  { id: 9, name: '11:00 AM' },
  { id: 10, name: '11:30 AM' },
  { id: 11, name: '01:00 PM' },
  { id: 12, name: '01:30 PM' },
  { id: 13, name: '02:00 PM' },
  { id: 14, name: '02:30 PM' },
  { id: 15, name: '03:00 PM' },
  { id: 16, name: '03:30 PM' },
  { id: 17, name: '04:00 PM' },
  { id: 18, name: '04:30 PM' },
  { id: 19, name: '05:00 PM' },
  { id: 20, name: '05:30 PM' },
  { id: 21, name: '06:00 PM' },
  { id: 22, name: '06:30 PM' },
  { id: 23, name: '07:00 PM' },
  { id: 24, name: '07:30 PM' },
  { id: 25, name: '08:00 PM' },
  { id: 26, name: '08:30 PM' },
  { id: 27, name: '09:00 PM' },
  { id: 28, name: '09:30 PM' },
  { id: 29, name: '10:00 PM' },
  { id: 30, name: '10:30 PM' },
  { id: 31, name: '11:00 PM' },
  { id: 32, name: '11:30 PM' },
  { id: 33, name: '12:00 AM' },
  { id: 34, name: '12:30 AM' }
];

export const TEST_STUDENTS = [
  {
    name: 'Dylan B.',
    selected: false,
  },
  {
    name: 'Peter C.',
    selected: false,
  },
  {
    name: 'James B.',
    selected: false,
  },
  {
    name: 'Mark K.',
    selected: false,
  },
  {
    name: 'John B.',
    selected: false,
  },
];

export const TEST_APPROVALS = [
  {
    name: 'Dylan B.',
    type: 'Student',
    to: false,
    from: false,
  },
  {
    name: 'Peter C.',
    type: 'Student',
    to: false,
    from: false,
  },
  {
    name: 'James B.',
    type: 'Student',
    to: false,
    from: false,
  },
  {
    name: 'Mark K.',
    type: 'Instructor',
    to: false,
    from: false,
  },
  {
    name: 'John B.',
    type: 'Instructor',
    to: false,
    from: false,
  },
];

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export const TEST_CHILDREN = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Gibbs',
    type: 'Trip',
    schoolName: 'Grace High School',
    grade: '12th Grade',
    status: 'Science Field Trip',
    approve: true,
  },
  {
    id: 2,
    firstName: 'Steve',
    lastName: 'Gibbs',
    type: 'Activity',
    schoolName: 'Grace High School',
    grade: '12th Grade',
    status: 'Soccer Practice',
    approve: false,
  },
  {
    id: 3,
    firstName: 'Liz',
    lastName: 'Gibbs',
    type: 'Trip',
    schoolName: 'Grace High School',
    grade: '12th Grade',
    status: 'Basket Ball Tournament',
    approve: false,
  },
];


export const CHILDREN_FROM_PARENT_GROUP_SCREEN = [
  {
    id: 1,
    name: 'JV Basketball Team (Boys)',
    status: true,
    instructors: 'Mark K., John B.',
    students: '10',
  },
  {
    id: 2,
    name: 'JV Swim Team (Boys)',
    status: true,
    instructors: 'Kent B., Mark K.',
    students: '5',
  },
];

export const GROUPS  =[
  {
    id: 1,
    name: "Group one",
    students: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "John Doe" },
    ],
    instructors: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "John Doe" },
    ],
    visible: false,
  },
  {
    id: 2,
    name: "Group two",
    students: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "John Doe" },
    ],
    instructors: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "John Doe" },
    ],
    visible: false,
  },
  {
    id: 3,
    name: "Group three",
    students: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "John Doe" },
    ],
    instructors: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "John Doe" },
    ],
    visible: false,
  },
];

export const AVAILABLE_PAYMENT_AMOUNTS = [
  {
    amount: 1,
    label: "$50 - Annually (Best Deal)",
  },
  {
    amount: 5,
    label: "$4.99 - Monthly",
  },
];

export const BACKGROUND_TASK_START_OPTIONS ={
  taskName: 'Example',
  taskTitle: 'TrackMyKidz',
  taskDesc: 'Tracking your Location',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane', // See Deep Lking for more info
  parameters: {
    delay: 2000,
  },
};
