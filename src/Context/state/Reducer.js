export const actions = {
  SET_GROUP: 'SET_GROUP',
  SET_SELECTED_GROUP: 'SET_SELECTED_GROUP',
  SET_SELECTED_ACTIVITY: 'SET_SELECTED_ACTIVITY',
  SET_SELECTED_DEPENDENT_ACTIVITY: 'SET_SELECTED_DEPENDENT_ACTIVITY',
  SET_CHILD_NAME: 'SET_CHILD_NAME',
  SET_SELECTED_CHILD: 'SET_SELECTED_CHILD',
  INSTRUCTOR_DETAIL: 'INSTRUCTOR_DETAIL',
  ORG_INSTRUCTORS: 'ORG_INSTRUCTORS',
  SET_TOGGLE: 'SET_TOGGLE',
  SET_SELECTED_SCHEDULE: 'SET_SELECTED_SCHEDULE',
  SET_THUMBNAIL: 'SET_THUMBNAIL',
  SET_USER: 'SET_USER',
  SET_GROUPS_STUDENTS: 'SET_GROUP_STUDENTS',
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_GROUP:
      return {
        ...state,
        group: action.payload,
      };

    case actions.SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case actions.SET_GROUPS_STUDENTS:
      return {
        ...state,
        students: action.payload,
      };
    case actions.SET_THUMBNAIL:
      return {
        ...state,
        thumbnail: action.payload,
      };
    case actions.SET_SELECTED_ACTIVITY:
      return {
        ...state,
        selectedActivity: action.payload,
      };
    case actions.SET_SELECTED_SCHEDULE:
      return {
        ...state,
        selectedSchedule: action.payload,
      };
    case actions.SET_SELECTED_GROUP:
      return {
        ...state,
        selectedGroup: action.payload,
      };
    case actions.SET_SELECTED_DEPENDENT_ACTIVITY:
      return {
        ...state,
        selectedDependentActivity: action.payload,
      };
    case actions.SET_CHILD_NAME:
      return {
        ...state,
        childName: action.payload,
      };
    case actions.SET_SELECTED_CHILD:
      return {
        ...state,
        child: action.payload,
      };
    case actions.INSTRUCTOR_DETAIL:
      return {
        ...state,
        instructorDetail: action.payload,
      };
    case actions.ORG_INSTRUCTORS:
      return {
        ...state,
        orgInstructors: action.payload,
      };
    case actions.SET_TOGGLE:
      return {
        ...state,
        toggle: action.payload,
      };
    default:
      return state;
  }
};
