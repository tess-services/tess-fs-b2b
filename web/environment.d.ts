declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_ID: string;
      ACCOUNT_ID: string;
      DATABASE_TOKEN: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { };

