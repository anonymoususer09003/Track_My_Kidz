import api from "@/Services";

export default async (page_number: number, page_size: number, config: any) => {
  console.log(
    `/activity/findall?page_number=${page_number}&page_size=${page_size}`
  );
  try {
    const response = await api.get(
      `/activity/findall?page_number=${page_number}&page_size=${page_size}`,
      config
    );
    return response.data;
  } catch (err) {
    console.log("errr-------", err);
  }
};
