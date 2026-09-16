'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { ROUTES } from '@/constants/routes'

export async function registerMember(payload: {
  manager_uid: string
  name: string
  line_uid: string
  phone: string
  email: string
  questionnaire: string
}) {
  try {
    const now = new Date().toISOString()
    const uid = nanoid(8)

    const data = {
      ...payload,
      uid,
      status: true,
      create_at: now,
      update_at: now
    }


    const { data: result } = await supabaseAdmin
      .from('member').select('*')
      .eq('phone', payload.phone)
      .eq('manager_uid', payload.manager_uid).single()

    console.log("registerMember:", result)

    if (result) {
      if (result.lockout_until == null || now > result.lockout_until) {
        return { success: false, message: '此電話已註冊' }
      } else {

        const newData = {
          ...payload,
          member_uid: result.uid,
          old_line_uid: result.line_uid,
        }
        console.error('membermember newData:', newData)
        return { success: true, type: 1, data: newData, message: '輸入驗證碼' }
      }

    }


    const { error } = await supabaseAdmin
      .from('member')
      .insert(data)

    if (error) {
      // Check for unique constraint on phone if necessary
      throw error
    }

    // revalidatePath(ROUTES.ADMIN.MEMBERS)
    return { success: true, uid: uid, type: 0 }
  } catch (err: any) {
    console.error('registerMember Error:', err)
    return { success: false, message: err.message }
  }
}

export async function verifyAndRebindMember(payload: {
  member_uid: string
  code: string
  line_uid: string
  old_line_uid: string
  name: string
  email: string
  questionnaire: string
}) {
  try {
    const now = new Date().toISOString()
    const { member_uid, code, line_uid, old_line_uid, name, email, questionnaire } = payload

    // 1. 查詢 DB 驗證 verification_code 與 lockout_until
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('member')
      .select('*')
      .eq('uid', member_uid)
      .single()
    console.error('membermember payload:', payload)
    if (fetchError || !member) {
      return { success: false, message: '找不到會員資料' }
    }

    if (!member.lockout_until || now > member.lockout_until) {
      return { success: false, message: '重綁定驗證時效已過期，請重新嘗試' }
    }

    if (!member.verification_code || member.verification_code.trim() !== code.trim()) {
      return { success: false, message: '驗證碼錯誤，請重新確認！' }
    }

    // 2. 驗證成功 -> 根據 member_uid 修改 line_uid，並清除 lockout_until/verification_code
    const updatePayload: Record<string, any> = {
      line_uid,
      name,
      email,
      lockout_until: null,
      verification_code: null,
      update_at: now
    };

    if (questionnaire !== null && questionnaire !== undefined) {
      updatePayload.questionnaire = questionnaire;
    }

    const { error: memberError } = await supabaseAdmin
      .from('member')
      .update(updatePayload)
      .eq('uid', member_uid);

    if (memberError) {
      return { success: false, message: `會員資料更新失敗: ${memberError.message}` }
    }

    // 3. 根據 old_line_uid 修改 booking 的 line_uid 改成最新的 line_uid
    if (old_line_uid && old_line_uid !== line_uid) {
      const { error: bookingError } = await supabaseAdmin
        .from('booking')
        .update({
          line_uid,
          update_at: now
        })
        .eq('line_uid', old_line_uid)

      if (bookingError) {
        console.error('booking update error:', bookingError)
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('verifyAndRebindMember Error:', err)
    return { success: false, message: err.message }
  }
}


export async function updateMember(payload: {
  uid: string
  status: boolean
  name: string
  phone: string
  email: string
}) {
  try {
    const now = new Date().toISOString()
    const { uid, status, name, phone, email } = payload

    const { error } = await supabaseAdmin
      .from('member')
      .update({
        status,
        name,
        phone,
        email,
        update_at: now
      })
      .eq('uid', uid)

    if (error) {
      throw error
    }

    revalidatePath(ROUTES.ADMIN.MEMBERS)
    return { success: true }
  } catch (err: any) {
    console.error('updateMember Error:', err)
    return { success: false, message: err.message }
  }
}

export async function checkMemberPhoneExists(managerUid: string, phone: string) {
  try {
    const cleanPhone = phone.replace(/[- ]/g, '').trim()
    if (!cleanPhone || !managerUid) return false

    const { data, error } = await supabaseAdmin
      .from('member')
      .select('uid')
      .eq('manager_uid', managerUid)
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (error) {
      console.error('checkMemberPhoneExists Error:', error)
      return false
    }

    return !!data
  } catch (err) {
    console.error('checkMemberPhoneExists Error:', err)
    return false
  }
}

export async function updateMemberLockout(uid: string, lockoutUntil: string) {
  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const { error } = await supabaseAdmin
      .from('member')
      .update({
        lockout_until: lockoutUntil,
        verification_code: verificationCode,
        update_at: new Date().toISOString()
      })
      .eq('uid', uid)

    if (error) {
      throw error
    }

    revalidatePath(ROUTES.ADMIN.MEMBERS)
    return { success: true, verificationCode }
  } catch (err: any) {
    console.error('updateMemberLockout Error:', err)
    return { success: false, message: err.message }
  }
}
