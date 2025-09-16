import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the service role key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the caller is a superadmin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid authorization token')
    }

    // Check if user is superadmin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'superadmin') {
      throw new Error('Insufficient permissions - superadmin required')
    }

    // Get request body
    const { email, paket_id, custom_duration } = await req.json()

    if (!email || !paket_id) {
      throw new Error('Email and paket_id are required')
    }

    // Generate random password
    const password = Math.random().toString(36).slice(-8)

    // Create user account
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'subscriber'
      }
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      throw new Error(`Failed to create user: ${createUserError.message}`)
    }

    // Get package duration
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('paket_pembelajaran')
      .select('durasi_hari')
      .eq('id', paket_id)
      .single()

    if (packageError) {
      console.error('Error fetching package:', packageError)
      throw new Error('Invalid package selected')
    }

    const durationDays = custom_duration ? parseInt(custom_duration) : packageData.durasi_hari

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + durationDays)

    // Create subscription
    const { error: subscriptionError } = await supabaseAdmin
      .from('subscribers')
      .insert({
        user_id: authData.user.id,
        paket_id,
        durasi_mulai: startDate.toISOString(),
        durasi_akhir: endDate.toISOString(),
        status: 'active'
      })

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      // If subscription creation fails, we should delete the user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`)
    }

    // Return success response with generated password
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email
        },
        password,
        message: 'Subscriber created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-subscriber function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})