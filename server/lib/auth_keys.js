/**
 * Auth keys.
 */
module.exports = {
  login: {
    dev: {
      facebook: {
        appID: 'DEV_APP_ID',
        appSecret: 'DEV_APP_SECRET',
        callbackURL: 'http://localhost:8080/auth/facebook/callback'
      }
    },

    test: {
      facebook: {
        appID: process.env.FB_ID || null,
        appSecret: process.env.FB_SECRET || null,
        callbackURL: 'http://test.runeee.com/auth/facebook/callback'
      }
    },

    production: {
      facebook: {
        appID: process.env.FB_ID || null,
        appSecret: process.env.FB_SECRET || null,
        callbackURL: 'http://runeee.com/auth/facebook/callback'
      }
    }
  },

  amazon: {
    ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'DEV_KEY',
    SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ||
      'DEV_SECRET',
    S3_BUCKET: process.env.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'runeee-test'
  }
};
