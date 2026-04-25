import { Resend } from 'resend'

import { getDrizzleDb } from '@/lib/db'
import { users } from '@/storage/database/shared/schema'

const resend = new Resend(process.env.RESEND_API_KEY)


async function generateLoveLetter(userName: string) {
    return `早安 ${userName}，今天也要记得，你值得被认真喜欢，也值得拥有一个温柔开始的新一天。`
  }

export async function sendDailyLoveLetter(
    userEmail: string,
    userName: string
  ) {
    // 用 AI 生成今天的情话
    const loveLetter = await generateLoveLetter(userName)
  
    await resend.emails.send({
      from: '纸片人男友 <hello@你的域名.com>',
      to: userEmail,
      subject: `早安 ${userName}，今天也想你了`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <p>${loveLetter}</p>
          <br/>
          <p>—— 你的纸片人男友</p>
          <p style="color: #999; font-size: 12px;">
            想跟我聊天？<a href="https://你的域名.com">点这里回来找我</a>
          </p>
        </div>
      `,
    })
  }
  export async function sendDailyLoveLetterToAll() {
    // 从数据库拿到所有用户
    const db = getDrizzleDb()

    if (!db) {
      throw new Error('DATABASE_URL is not set')
    }
    
    const allUsers = await db.select().from(users)  
    for (const user of allUsers) {      try {
        await sendDailyLoveLetter(user.username, user.username)      } catch (error) {
            console.error(`给 ${user.username} 发情话失败：`, error)        // 某个用户失败不影响其他用户
      }
    }
  }