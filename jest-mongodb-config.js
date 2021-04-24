module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '4.0.14',
      skipMD5: true,
    },
    autoStart: false,
    instance: {
      dbName: 'test',
    },
  },
};
