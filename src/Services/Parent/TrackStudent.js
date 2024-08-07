import api from '@/Services';

export default async (
  studentId,
  parentLatitude,
  parentLongititude,
  toggleAlert,
  distanceAllowed,
  kilometers
) => {
  const response = await api.post(
    `/user/parent/v2/alert/trackStudent?studentId=${studentId}&parentLatitude=${parentLatitude}&parentLongitude=${parentLongititude}&toggleAlert=${toggleAlert}&distanceAllowed=${distanceAllowed}&kilometers=${kilometers}`
  );
  return response.data;
};
