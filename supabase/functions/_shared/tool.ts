import dayjs from "https://esm.sh/dayjs@1.11.10";
import utc from "https://esm.sh/dayjs@1.11.10/plugin/utc";
import timezone from "https://esm.sh/dayjs@1.11.10/plugin/timezone";
// 必須延伸插件才能使用時區功能
dayjs.extend(utc);
dayjs.extend(timezone);
export const formatDateTime = (date)=>{
  return dayjs(date).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm");
};
/**
 * 核心處理函數：支援寬鬆匹配 (只要有輸入且樣板有 {} 即視為有效)
 */ export const processCommand = (input, pattern)=>{
  if (typeof input !== 'string' || typeof pattern !== 'string') {
    return {
      isValid: false
    };
  }
  // 1. 偵測樣板是否含有動態內容 {...}
  const dynamicRegex = /^(.*)\{(.*)\}$/;
  const match = pattern.match(dynamicRegex);
  console.log("match1", match);
  if (match) {
    //進來表示後面一定帶有{}
    const prefix = match[1]; // 樣板前綴 (例如: "取消預約")
    const logicBody = match[2]; // 括號內邏輯 (例如: "booking.update.status=3")
    if (!input.startsWith(prefix)) {
      return {
        isValid: false
      };
    }
    if (input.length > 0) {
      let uid = input;
      if (prefix && input.startsWith(prefix)) {
        uid = input.substring(prefix.length);
      }
      if (!logicBody) {
        return {
          isValid: true,
          uid: uid
        };
      }
      const [path, rawVal] = logicBody.split('=');
      const pathParts = path ? path.split('.') : [];
      return {
        isValid: true,
        updateData: {
          uid: uid.trim(),
          table: pathParts[0],
          field: pathParts[2],
          value: isNaN(Number(rawVal)) ? rawVal === 'true' ? true : rawVal : Number(rawVal)
        }
      };
    }
    return {
      isValid: false
    };
  }
  return {
    isValid: input === pattern
  };
};
