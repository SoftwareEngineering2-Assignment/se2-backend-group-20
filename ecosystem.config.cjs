/**
 * configuring backend start process and the server's listening port
 */
module.exports = {
  apps: [
    {
      name: 'se2-backend-20',
      script: 'npm',
      args: 'start',
      env: {PORT: 3020},
    },
  ],
};
