import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, telegramData } = await req.json()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set')
    }

    // 1. Verify Telegram Hash
    const { hash, ...dataToCheck } = telegramData
    const dataCheckArr = []
    for (const key of Object.keys(dataToCheck).sort()) {
      dataCheckArr.push(`${key}=${dataToCheck[key]}`)
    }
    const dataCheckString = dataCheckArr.join('\n')

    const encoder = new TextEncoder()
    
    // Hash bot token with SHA256
    const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(botToken))
    
    // HMAC-SHA256
    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataCheckString)
    )
    
    const hashHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (hashHex !== hash) {
      return new Response(
        JSON.stringify({ error: 'Invalid Telegram hash' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash is valid
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'verify_buyer') {
      // For CollectionPage: just return the verified data
      return new Response(
        JSON.stringify({ verified: true, user: telegramData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    
    if (action === 'login') {
      // For AuthPage: create or log in user
      const syntheticEmail = `${telegramData.id}@telegram.trustgrid.local`
      
      // Generate a strong, deterministic password using HMAC of the telegram_id keyed by the botToken
      const pwKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(botToken),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const pwSignature = await crypto.subtle.sign(
        'HMAC',
        pwKey,
        encoder.encode(`password_seed_${telegramData.id}`)
      )
      const passwordHashHex = Array.from(new Uint8Array(pwSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      // Ensure password meets Supabase requirements (symbols, uppercase, etc) if configured, though hex is usually long enough
      const password = `Tg!${passwordHashHex}`

      // We use admin.getUserById/listUsers - wait, listUsers is paginated.
      // Better to just try signInWithPassword first, if it fails due to invalid credentials, create the user.
      const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: syntheticEmail,
        password: password
      })

      if (signInError && signInError.message.includes('Invalid login credentials')) {
         // Create the user
         const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: syntheticEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: telegramData.first_name + (telegramData.last_name ? ` ${telegramData.last_name}` : ''),
              telegram_username: telegramData.username,
              avatar_url: telegramData.photo_url
            }
         })
         
         if (createError) throw createError
         
         if (newUser.user) {
            await supabaseAdmin.from('profiles').upsert({
              id: newUser.user.id,
              telegram_id: telegramData.id.toString(),
              telegram_username: telegramData.username,
              avatar_url: telegramData.photo_url,
              full_name: telegramData.first_name,
              company_name: telegramData.first_name + "'s Business" // default
            })
         }
         
         // Retry sign in
         const { data: retrySessionData, error: retrySignInError } = await supabaseAdmin.auth.signInWithPassword({
           email: syntheticEmail,
           password: password
         })
         
         if (retrySignInError) throw retrySignInError
         
         return new Response(
           JSON.stringify({ session: retrySessionData.session }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
      } else if (signInError) {
         throw signInError
      } else {
         // User exists, update profile
         await supabaseAdmin.from('profiles').update({
            telegram_id: telegramData.id.toString(),
            telegram_username: telegramData.username,
            avatar_url: telegramData.photo_url,
         }).eq('id', sessionData.user.id)
         
         return new Response(
           JSON.stringify({ session: sessionData.session }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
      }
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
