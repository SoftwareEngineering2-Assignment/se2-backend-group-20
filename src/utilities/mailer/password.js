const baseUrl = process.env.PLATFORM_URI;
const logo = `${process.env.SERVER_URI}/logo.png`;
const link = (token) => `${baseUrl}/reset-password?token=${token}`;

/**
 * Creates and returns an email with a password reset token. The parameters given are the
 * platform's logo and the reset token needed for changing the password.
 */

module.exports = (token) => (`
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd>
    <html xmlns="http://www.w3.org/1999/xhtml" style="font-family: Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
      <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Codin Platform</title>
        <style>
          body { 
            padding: 0 !important;
            background-color: #fff;
            font-family: Helvetica,Arial,sans-serif;
            box-sizing: border-box;
            font-size: 14px;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: none;
            width: 100% !important;
            height: 100%;
            line-height: 1.6em; 
            overflow-y: auto;
          }
          table {
            width: 60%;
            margin: 0 auto;
          }
          tr {
            margin: 20px 0;
            color:#565a5c;
            font-size: 18px;
            display: flex;
          }
        </style>
      </head>
      <body itemscope itemtype="http://schema.org/EmailMessage">
        <table class="body-wrap">
          <tr>
            <td style="width:100%;display:flex;">
              <img style="display:block;width:300px;margin:0 auto;" src="${logo}"/>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Hi,</strong>
            </td>
          </tr>
          <tr>
            <td>
              You recently requested to reset your password for your codin platform account. Click the button below
              to reset it.
            </td>
          </tr>
          <tr>
            <td style="width:100%;display:flex;">
              <a
                href="${link(token)}"
                style="text-decoration:none;cursor:pointer;color:#FFFFFF;background-color:#FF9D66;font-size:1rem;padding:0.5rem;border-radius:5px;border:none;margin:0 auto"
              >
                Reset your password
              </a>
            </td>
          </tr>
          <tr>
            <td>
              If you did not request a password reset, please ignore this email or reply to let us know.
            </td>
          </tr>
          <tr>
            <td>
              Thanks,
              <br>Codin Platform Team
            </td>
          </tr>
        </table>
      </body>
      </html>`
);
