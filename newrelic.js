/**
 * New Relic agent configuration.
 */
if (process.env.NODE_ENV === 'PRODUCTION') {
  exports.config = {
    app_name: ['Runeee.com - production'],
    license_key: 'bd1027b7e2d78c66ac3eebd90f038387a4ad6d77',
    logging: {
      level: 'info'
    }
  };
} else if (process.env.NODE_ENV === 'TEST') {
  exports.config = {
    app_name: ['Runeee.com - test'],
    license_key: '0cfe3827ed55665b3e18eb987eff11defd4b128c',
    logging: {
      level: 'info'
    }
  };
} else {
  exports.config = {
    app_name: ['Runeee.com - dev'],
    license_key: '0cfe3827ed55665b3e18eb987eff11defd4b128c',
    logging: {
      level: 'info'
    }
  };
}
