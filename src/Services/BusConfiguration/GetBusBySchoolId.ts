import api from "@/Services";

export default async (
  school_id: number,
  page_number: number,
  page_size: number
) => {
  return await api.get(
    `/user/bus/find-all-buses-BySchoolId?school_id=${school_id}&page_number=${page_number}&page_size=${page_size}`
  );
};
