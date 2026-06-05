import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    // Require standard Bearer token header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Hash the token identically to how the client hashed it for storage
    const keyHash = crypto.createHash('sha256').update(token).digest('hex');

    // Use Service Role to bypass RLS for webhook execution
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify key hash matches a user
    const { data: apiKeyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id')
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API key' }, { status: 401 });
    }

    const userId = apiKeyData.user_id;

    // Fetch ACTIVE vaults for the user to reset their trigger_date
    const { data: vaults, error: fetchError } = await supabaseAdmin
      .from('vaults')
      .select('id, countdown_days')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE');

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to retrieve vaults' }, { status: 500 });
    }

    let updatedCount = 0;

    // Iterate and update trigger_date = NOW() + countdown_days
    if (vaults && vaults.length > 0) {
       for (const v of vaults) {
           const newDate = new Date();
           newDate.setDate(newDate.getDate() + (v.countdown_days || 30));
           
           await supabaseAdmin
             .from('vaults')
             .update({ trigger_date: newDate.toISOString() })
             .eq('id', v.id);
             
           updatedCount++;
       }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Proof-of-Life registered. Renewed ${updatedCount} ACTIVE vaults.` 
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
