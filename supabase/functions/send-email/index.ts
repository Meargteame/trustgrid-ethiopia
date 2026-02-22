import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, type, data } = await req.json()
    
    let subject = ''
    let html = ''

    if (type === 'invite') {
        subject = 'You have been invited to join TrustGrid Team'
        const link = data.url || '#'
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Welcome to TrustGrid!</h2>
              <p>You have been invited to join the team as a <strong>${data.role}</strong>.</p>
              <p>Click below to accept and get started:</p>
              <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Join Team</a>
            </div>
        `
    } else if (type === 'verify_review') {
        // This is sent to the reviewer to ask for verification
        const companyName = data.companyName || 'Our Company'
        const reviewerName = data.name || 'Valued Customer'
        const verifyLink = data.verifyLink || '#'

        subject = `Please verify your review for ${companyName}`
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Hi ${reviewerName},</h2>
              <p>Thanks for your kind words! We really appreciate your feedback on working with <strong>${companyName}</strong>.</p>
              
              <p>To help us build trust with future clients, could you please verify this review by clicking the button below? It only takes one click.</p>
              
              <div style="margin: 30px 0;">
                <a href="${verifyLink}" style="display: inline-block; padding: 14px 28px; background: #D4F954; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; border: 2px solid #000;">Verify My Review</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">If the button doesn't work, copy this link:<br/> <a href="${verifyLink}">${verifyLink}</a></p>
              
              <p>Thanks,<br/>${companyName}</p>
            </div>
        `
    }


    // Debug logging
    console.log(`Sending email to: ${to}, Type: ${type}`);

    const res = await resend.emails.send({
      from: 'onboarding@resend.dev', // Changed from "TrustGrid <...>" to simple address to avoid format issues
      to: to, // Pass directly as string or array
      subject: subject,
      html: html,
    })

    const { data: emailData, error } = res;
    
    if (error) {
        console.error('Resend API Error:', JSON.stringify(error));
        
        // Handle Rate Limiting specifically
        if (error.statusCode === 429 || error.name === 'rate_limit_exceeded') {
             return new Response(JSON.stringify({ 
                 error: "Too many emails sent too quickly. Please wait a minute and try again.",
                 details: error 
             }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429, 
            })
        }

        return new Response(JSON.stringify({ error, message: "Resend API rejected the request" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Function Crash:', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
