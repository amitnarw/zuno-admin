const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wrqleaytpdlcbxwzkdgc.supabase.co',
  '826953d355816e4eb180d9794b05848a3bb379105df2e4861fb508335f0a51b2'
);

async function createTable() {
  try {
    // Try to access the table to see if it exists
    const { error } = await supabase
      .from('device_tokens')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Table does not exist. Creating via Edge Function...');
      // Try creating via a function call
      const { data, error: fnError } = await supabase.functions.invoke('create-device-tokens-table');
      if (fnError) {
        console.log('Function not available:', fnError.message);
        console.log('Please create the table manually in Supabase SQL Editor:');
        console.log(`
create table if not exists public.device_tokens (
    user_id uuid references auth.users(id) on delete cascade,
    token text not null,
    platform text not null check (platform in ('android', 'ios')),
    updated_at timestamptz default now(),
    primary key (user_id, token)
);
alter table public.device_tokens enable row level security;
create policy "Users can manage own device tokens"
    on public.device_tokens for all
    using (auth.uid() = user_id);
        `);
      } else {
        console.log('Table created via function:', data);
      }
    } else {
      console.log('Table already exists:', error);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

createTable();
