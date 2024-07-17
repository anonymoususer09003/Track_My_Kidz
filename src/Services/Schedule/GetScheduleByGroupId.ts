import api from "@/Services";

export default async (params:any) => {

  try {
    const{groupId,page_number,page_size,sort,isPractice,searchString}=params
    let url=  `/schedule/group/${groupId}?isPractice=${isPractice}&pageNumber=${page_number}&pageSize=${page_size}&sortBy=${sort}`
    console.log('00000e0e0e00e0e0e0e0882898289982892989829829829898298'+ searchString?url:url)
    const response = await api.get(
    url
    
    
    );
    return response?.data;
  } catch (err) {
    console.log("errr-------", err);
  }
};
