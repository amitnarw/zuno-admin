import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'wrqleaytpdlcbxwzkdgc'
const FCM_SERVICE_ACCOUNT = process.env.FCM_SERVICE_ACCOUNT || '{}' // JSON string of service account

let accessToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken!
  }

  const serviceAccount = JSON.parse(FCM_SERVICE_ACCOUNT)
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  }

  // Simple JWT signing - in production, use a proper JWT library
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64')
  const claim = Buffer.from(JSON.stringify(payload)).toString('base64')

  // For server-side, we need to sign with the private key
  // Since we can't easily sign JWT in Node without crypto, use the service account directly
  // Alternative: use gtoken or google-auth-library
  
  // For now, try using the service account private key to sign
  const { execSync } = require('child_process')
  const crypto = require('crypto')
  
  const signingInput = `${header}.${claim}`
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(serviceAccount.private_key, 'base64')
  const jwt = `${signingInput}.${signature}`

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await tokenResponse.json()
  accessToken = tokenData.access_token
  tokenExpiry = (now + 3500) * 1000

  return accessToken!
}

async function sendFcmMessage(token: string, title: string, body: string): Promise<boolean> {
  try {
    const token = await getAccessToken()
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title,
              body,
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'zuno_notifications',
                icon: 'ic_notification',
                color: '#3E80B1',
              },
            },
          },
        }),
      }
    )

    return response.ok
  } catch (e) {
    console.error('FCM send error:', e)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { segment, title, body } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get target users based on segment
    let userIds: string[] = []

    if (segment === 'all') {
      const { data: allUsers } = await admin.from('users').select('id')
      userIds = (allUsers ?? []).map((u: any) => u.id)
    } else {
      let statusFilter = ''
      if (segment === 'active_subs') statusFilter = 'active,trial'
      else if (segment === 'expired') statusFilter = 'expired'
      else if (segment === 'trial') statusFilter = 'trial'
      else statusFilter = 'active,trial'

      const { data: subs } = await admin
        .from('subscriptions')
        .select('user_id')
        .in('status', statusFilter.split(','))
      userIds = (subs ?? []).map((s: any) => s.user_id)
    }

    // Get FCM device tokens for target users
    const { data: deviceTokens } = await admin
      .from('device_tokens')
      .select('token')
      .in('user_id', userIds)

    const tokens = (deviceTokens ?? []).map((d: any) => d.token)

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        sentTo: 0,
        segment,
        message: 'No device tokens found for target users',
      })
    }

    // Send FCM notifications
    let sentCount = 0
    const sendPromises = tokens.map((token) =>
      sendFcmMessage(token, title, body).then((success) => {
        if (success) sentCount++
      })
    )
    await Promise.all(sendPromises)

    return NextResponse.json({
      success: true,
      sentTo: sentCount,
      totalTokens: tokens.length,
      segment,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}