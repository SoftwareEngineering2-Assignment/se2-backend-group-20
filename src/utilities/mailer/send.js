/**
 * send the mail for password change
 */
const sg = require('@sendgrid/mail');

sg.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (to, subject, email) => {
  /**
   * @name sendEmail
   * @description Is used to send an email to a user
   */
  const msg = {
    from: "karanikio@auth.gr",
    to,
    subject,
    html: email
  };

  console.log(msg);
  sg.send(msg).then(() => console.log("HERE"));
};
