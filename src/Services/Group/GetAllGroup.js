import api from "@/Services";

export default async (user_id, page_number, page_size, config) => {
  // console.log(
  //   "log09900909",
  //   `/group/findAll?user_id=${user_id}&page_number=${page_number}&page_size=${page_size}`
  // );
  const response = await api.get(
    `/group/findall?user_id=${user_id}&page_number=${page_number}&page_size=${page_size}`,
    config
  );
  return response.data;
};
