require('dotenv').config();

const keyVault = require("orm-keyvault-module");

const configKeys = [
    "LOGZ_IO_KEY",
    "HOST_LOCATION_NAME",

    "MAILER_LITE_API_KEY",
    "COSMOS_DB_CONNECTION_STRING",
    "COSMOS_DB_NAME",

    "JWT_TOKEN_SECRET",
    "JWT_REFRESH_SECRET",
    
    "MAILGUN_USERNAME",
    "MAILGUN_PASSWORD",

    "APP_LINK_URL",
    
    "INDEX_URL",
    "INDEX_NAME",
    "INDEX_KEY",

    "BRANCH_IO_KEY",
    "BRANCH_IO_SECRET",

    "GOOGLE_MAPS_KEY",

    "FIREBASE_API_KEY"
];

module.exports = {

    async init() {
        try {
            
            await keyVault.copyKeysToEnv();

            //Validate keys that have been stored
            configKeys.forEach((configKey)=>{

                if(!process.env[configKey])
                    throw new Error(`Missing environment varable ${configKey}`);
                
            })

        } catch(err){
            console.log(err);
            throw err;
        }
    }
}
