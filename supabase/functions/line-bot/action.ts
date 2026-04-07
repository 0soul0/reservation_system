export const executeProcedure = async (searchData, supabase, payload = {})=>{
  console.log("searchData", searchData);
  console.log("payload", payload);
  const { lineId, managerUid } = payload;
  switch(searchData.procedure_name){
    // case "line_get_booking_history":
    //     return await getBookingHistory(searchData.procedure_name, supabase, lineId);
    // case "line_get_member": // 順便擴充你之前的功能
    //     return await callProcedure(searchData.procedure_name, supabase, lineId);
    default:
      return await callProcedure(searchData.procedure_name, supabase, lineId, managerUid);
  }
};
const callProcedure = async (procedureName, supabase, lineId, managerUid)=>{
  const { data, error } = await supabase.rpc(procedureName, {
    luid: lineId,
    m_uid: managerUid
  });
  console.log("callProcedure: ", data, error);
  if (error) {
    return "";
  }
  return data;
};
