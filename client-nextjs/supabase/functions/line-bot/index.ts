import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, isProcedureCheckText } from "./constant.ts";
import { LineService } from "./line_server.ts";
import { checkProcedure } from "./action.ts";

//npx supabase functions deploy line-bot --project-ref rqczzxaxyntjdyqifalj --no-verify-jwt

// 初始化 Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    // 1. 驗證是否為 POST 請求
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(req.url);
    const uid = url.searchParams.get("uid"); //manager id

    const { events } = await req.json();
    const lineId = events?.[0]?.source?.userId;

    console.log("uid:", uid);
    console.log("req:", req);
    console.log("events:", events);
    console.log("lineId:", lineId);
    // 2. 遍歷 Line 傳來的事件
    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMsg = event.message.text.trim();
        const replyToken = event.replyToken;
        let responseText = "";
        console.log("managerData in:");
        const managerData = await getManagerData(uid);
        console.log("managerDataw:", managerData);
        if (!managerData) {
          responseText = "查無此官方帳號";
        }

        if (managerData && managerData.line_notify_content) {
          try {
            const notifyMap = typeof managerData.line_notify_content === 'string'
              ? JSON.parse(managerData.line_notify_content)
              : managerData.line_notify_content;

            if (notifyMap[userMsg]) {
              responseText = notifyMap[userMsg];
            } else {
              responseText = managerData.line_notify_default || "查無此關鍵字，請重新輸入。";
            }
            console.log("responseText in:", responseText);

          } catch (parseError) {
            console.log("JSON 解析失敗:", parseError);
            responseText = "系統資料格式錯誤。";
          }
        }
        console.log("responseText:", responseText);
        // --- 邏輯 A: 判斷是否需要呼叫 Procedure ---
        if (responseText.includes(isProcedureCheckText)) {
          const procedureName = responseText.replace(isProcedureCheckText, "").trim()
          const bookingHistory = await checkProcedure(procedureName, supabase, lineId) || [];
          responseText = JSON.stringify(bookingHistory)
        }
        console.log("responseText bookingHistory:", responseText);
        // 3. 發送回覆給 Line
        await LineService.reply(managerData.line_channel_access_token, replyToken, responseText);
        console.log("responseText line_channel_access_token:", managerData.line_channel_access_token);
        console.log("responseText replyToken:", managerData.replyToken);
        console.log("responseText responseText:", managerData.responseText);
      }
    }

    return new Response(JSON.stringify({ message: "success" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});



const getManagerData = async (uid: string | null) => {
  if (!uid) return null;

  const { data: managerData, error } = await supabase
    .from("manager")
    .select("line_notify_content, line_notify_default, line_channel_access_token") // <-- 務必加入這一項
    .eq("uid", uid)
    .single();

  if (error) {
    console.error("查詢 Manager 失敗:", error);
    return null;
  }
  return managerData;
};

