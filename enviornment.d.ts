declare global {
    namespace NodeJS {
      interface ProcessEnv {
        readonly DB_USER: string,
        readonly DB_HOST: string,
        readonly DB_PASSWORD: string,
        readonly DB_PORT: string,

        readonly SESSION_ID: string,
        readonly APPLICATION_ID: string,
        readonly USER_ID: string,
        readonly REQUEST_ID: string,
        readonly DEVICE_ID: string,
        readonly API_ACCESS_TOKEN: string,
      }
    }
  }
  
  export {}