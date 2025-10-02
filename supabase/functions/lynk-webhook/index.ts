import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LynkWebhookPayload {
  order_id: string;
  transaction_id: string;
  amount: number;
  status: string;
  customer_email: string;
  payment_method?: string;
  webhook_signature?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const handler = async (req: Request): Promise<Response> => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const payload: LynkWebhookPayload = await req.json();
    console.log('Received lynk.id webhook:', payload);

    // Validate required fields
    if (!payload.order_id || !payload.customer_email || !payload.amount) {
      console.error('Missing required fields in webhook payload');
      return new Response('Missing required fields', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Flat credit system: Every order gets 100 credits regardless of payment amount
    const creditsAmount = 100;

    // Check if transaction already exists
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('id, status')
      .eq('order_id', payload.order_id)
      .single();

    if (existingTransaction) {
      if (existingTransaction.status === 'completed') {
        console.log('Transaction already processed:', payload.order_id);
        return new Response('Transaction already processed', { 
          status: 200, 
          headers: corsHeaders 
        });
      }
    }

    // Determine transaction status based on lynk.id status
    let transactionStatus = 'pending';
    if (payload.status === 'success' || payload.status === 'completed') {
      transactionStatus = 'completed';
    } else if (payload.status === 'failed' || payload.status === 'cancelled') {
      transactionStatus = 'failed';
    }

    // Upsert payment transaction record
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .upsert({
        order_id: payload.order_id,
        customer_email: payload.customer_email.toLowerCase(),
        amount: payload.amount,
        credits_amount: creditsAmount,
        status: transactionStatus,
        payment_method: payload.payment_method || 'lynk.id',
        lynk_transaction_id: payload.transaction_id,
        webhook_data: payload,
        processed_at: transactionStatus === 'completed' ? new Date().toISOString() : null
      });

    if (transactionError) {
      console.error('Error saving transaction:', transactionError);
      return new Response('Error saving transaction', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // If payment is successful, add credits to user profile
    if (transactionStatus === 'completed') {
      console.log(`Processing successful payment, granting flat 100 credits regardless of amount (${payload.amount})...`);
      
      // 1. Add email to authorized_emails if not exists
      const { error: authorizedEmailError } = await supabase
        .from('authorized_emails')
        .upsert({
          email: payload.customer_email.toLowerCase()
        }, {
          onConflict: 'email',
          ignoreDuplicates: true
        });

      if (authorizedEmailError) {
        console.error('Error adding to authorized_emails:', authorizedEmailError);
      } else {
        console.log(`Email ${payload.customer_email} added to authorized_emails`);
      }
      
      // 2. Find user profile by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('email', payload.customer_email.toLowerCase())
        .single();

      if (profileError || !profile) {
        console.log('User profile not found, will be processed when user signs up');
        
        // Create credit topup record for when user signs up
        const { error: topupError } = await supabase
          .from('credit_topups')
          .upsert({
            email: payload.customer_email.toLowerCase(),
            credits_added: creditsAmount,
            external_order_id: payload.order_id,
            applied: false
          });

        if (topupError) {
          console.error('Error creating credit topup:', topupError);
        } else {
          console.log(`Credit topup record created for ${payload.customer_email}`);
        }
      } else {
        // Update user credits directly
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            credits: (profile.credits || 0) + creditsAmount
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('Error updating user credits:', updateError);
          return new Response('Error updating user credits', { 
            status: 500, 
            headers: corsHeaders 
          });
        }

        console.log(`Successfully added 100 credits to user ${profile.id} (payment amount: ${payload.amount})`);
      }
    }

    console.log('Webhook processed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        credits_added: transactionStatus === 'completed' ? creditsAmount : 0
      }), 
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
};

serve(handler);