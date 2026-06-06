const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('your-project-id') || 
  supabaseAnonKey.includes('your-anon-public-key');

if (isPlaceholder) {
  console.error(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or are using placeholders. Please configure them in your .env file and restart your dev server.'
  );
}

const createClient = window.supabase?.createClient;

const makeMockQuery = (message) => {
  const mockPromise = Promise.resolve({ data: null, error: { message } });
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockPromise,
    upsert: () => mockPromise,
    update: () => mockPromise,
    delete: () => mockQuery,
    eq: () => mockQuery,
    order: () => mockQuery,
    maybeSingle: () => mockPromise,
    then: (resolve) => resolve({ data: null, error: { message } })
  };
  return mockQuery;
};

// Export the real client if configured, otherwise export a mock client to prevent top-level rendering crashes
export const supabase = (!isPlaceholder && createClient)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => makeMockQuery('Supabase is not configured. Please configure your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart your Vite dev server.')
    };
