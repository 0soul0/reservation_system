export const checkProcedure = async (...args: any[]) => {
    console.log("args", args)
    switch (args[0]) {
        case "get_booking_history":
            return await getBookingHistory(args[0], args[1], args[2]);
        default:
            return "";
    }
}




const getBookingHistory = async (procedureName: string, supabase: any, lineId: string | null) => {
    const { data, error } = await supabase.rpc(procedureName, {
        p_line_uid: lineId
    });
    console.log("getBookingHistory", data)
    if (error) {
        return "";
    }
    return data;
}
