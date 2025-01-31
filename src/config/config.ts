// src/config/config.ts
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
  
  const config: Config = {
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
    return config[env];
  };
  
  export const getBaseUrl = (): string => {
    return getConfig().baseUrl;
  };
  