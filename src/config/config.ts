import { createClient } from '@supabase/supabase-js';

export interface EnvironmentConfig {
  baseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiEndpoints: {
    auth: string;
    orders: string;
    profiles: string;
  };
}

interface Config {
  [key: string]: EnvironmentConfig;
}

const environmentUrls = {
  development: ['localhost', '127.0.0.1'],
  test: ['test.maniv-pc.github.io'],
  production: ['maniv-pc.github.io']
};

const configSettings: Config = {
  development: {
      baseUrl: 'http://localhost:3000',
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
      supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
      apiEndpoints: {
          auth: '/api/auth',
          orders: '/api/orders',
          profiles: '/api/profiles'
      }
  },
  test: {
      baseUrl: 'https://test.maniv-pc.github.io',
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
      supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
      apiEndpoints: {
          auth: '/api/auth',
          orders: '/api/orders',
          profiles: '/api/profiles'
      }
  },
  production: {
      baseUrl: 'https://maniv-pc.github.io',
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
      supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
      apiEndpoints: {
          auth: '/api/auth',
          orders: '/api/orders',
          profiles: '/api/profiles'
      }
  }
};

export const getCurrentEnvironment = (): string => {
  const hostname = window.location.hostname;
  
  for (const [env, urls] of Object.entries(environmentUrls)) {
      if (urls.includes(hostname)) return env;
  }
  
  return 'production';
};

export const getConfig = (): EnvironmentConfig => {
  const env = getCurrentEnvironment();
  const currentConfig = configSettings[env];
  
  if (!currentConfig.supabaseUrl || !currentConfig.supabaseAnonKey) {
      console.error('Missing Supabase configuration:', {
          url: !!currentConfig.supabaseUrl,
          key: !!currentConfig.supabaseAnonKey,
          env
      });
  }
  
  try {
      new URL(currentConfig.supabaseUrl);
  } catch (e) {
      console.error('Invalid Supabase URL:', currentConfig.supabaseUrl);
  }
  
  return currentConfig;
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
    if (!supabaseInstance) {
        const config = getConfig();
        supabaseInstance = createClient(
            config.supabaseUrl,
            config.supabaseAnonKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                    storageKey: 'supabase.auth.token',
                    flowType: 'pkce'
                }
            }
        );
    }
    return supabaseInstance;
};

export const supabase = getSupabase();

export const getBaseUrl = (): string => {
  return getConfig().baseUrl;
};