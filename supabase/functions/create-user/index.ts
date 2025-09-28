import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'manager' | 'supervisor' | 'clerk';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create user function called');

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    // Check if this is a bootstrap scenario (no admin users exist)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: adminUsers, error: adminCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    const isBootstrap = !adminCheckError && (!adminUsers || adminUsers.length === 0);
    console.log('Bootstrap check:', { adminUsers, adminCheckError, isBootstrap });
    
    if (!isBootstrap) {
      console.log('Normal mode: Checking authentication');
      // Normal flow - require authentication
      if (!authHeader) {
        console.error('No authorization header');
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Create Supabase client with anon key to verify the calling user
      const supabaseAnon = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      // Verify the calling user has admin role
      const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
      if (userError || !user) {
        console.error('User verification failed:', userError);
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabaseAnon
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !roleData || roleData.role !== 'admin') {
        console.error('Insufficient privileges:', roleData?.role);
        return new Response(
          JSON.stringify({ error: 'Insufficient privileges' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } else {
      console.log('Bootstrap mode: Creating first admin user - skipping authentication');
    }

    // Parse request body
    const { first_name, last_name, username, email, password, phone, role }: CreateUserRequest = await req.json();
    console.log('Creating user with email:', email, 'username:', username, 'role:', role);

    // Validate required fields
    if (!first_name || !last_name || !username || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if username already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking username:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name,
        last_name: last_name
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!authData.user) {
      console.error('No user returned from auth creation');
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Update profile with additional fields
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        username: username,
        phone: phone || null,
        status: 'active'
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't fail completely, just log the error
    }

    // Set user role (delete existing first to avoid conflicts)
    const { error: deleteRoleError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', authData.user.id);

    // Then insert the new role
    const { error: roleCreateError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: role
      });

    if (roleCreateError) {
      console.error('Error setting user role:', roleCreateError);
      // Don't fail completely, just log the error
    }

    console.log('User created successfully:', username);

    return new Response(
      JSON.stringify({ 
        message: 'User created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: username
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);