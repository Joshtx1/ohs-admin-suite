import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Temp master reset function called');

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find master user
    const { data: masterRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'master')
      .single();

    if (roleError || !masterRole) {
      console.error('Master user not found:', roleError);
      return new Response(
        JSON.stringify({ error: 'Master user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Reset master password to temporary password
    const tempPassword = 'TempMaster123!';
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      masterRole.user_id,
      { password: tempPassword }
    );

    if (resetError) {
      console.error('Error resetting master password:', resetError);
      return new Response(
        JSON.stringify({ error: resetError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Master password reset successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Master password reset successfully',
        username: 'master_admin',
        temporaryPassword: tempPassword
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in temp-master-reset function:', error);
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