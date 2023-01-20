/**
 * configuring backend start process and the listening port
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
