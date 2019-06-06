import emailResponsiveStyleTag from './email-responsive-style-tag'
import { resolveUserName } from './helpers'

export default ({ typeTitle, user, mainContentHtml, mainContentText, accessUrl, optOutUrl, reasonExplanation }) => ({
  html: `
    <!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${typeTitle}- Notification Email</title>
  ${emailResponsiveStyleTag}
</head>
<body class="">

<!--<span class="preheader">This is preheader text. Some clients will show this text as a preview.</span>-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
  <tr>
    <td>&nbsp;</td>
    <td class="container">
      <div class="content">

        <!-- START CENTERED WHITE CONTAINER -->
        <table role="presentation" class="main">

          <!-- START MAIN CONTENT AREA -->
          <tr>
            <td class="wrapper">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div class="align-right">
                      <img class="logo" src="cid:logo@unee-t.com"/>
                    </div>
                    <p>Hi ${resolveUserName(user)}</p>
                    {mainContentHtml}
                    <p>
                      Click on this <a href="${accessUrl}">link</a> to see the current status for this case.<br />
                      Participate in the conversation, add comments or pictures directly so we can resolve this faster.
                    </p>
                    <p>
                      Regards,<br />
                      Unee-T<br />
                      THE Web App to Manage Incidents in your Properties
                    </p>
                    <hr />
                    <div class="bottom-explanation">
                      You are receiving this email because ${reasonExplanation}.
                    </div>
                    <div class="unsub-instruction">
                      <a href="${optOutUrl}">Unsubscribe</a> from these type of emails. <a href="${optOutUrl}">Manage your settings</a> for all type of email updates
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- END MAIN CONTENT AREA -->
        </table>
        <!-- END CENTERED WHITE CONTAINER -->

        <!-- START FOOTER -->
        <div class="footer">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td class="content-block powered-by">
                Powered by <a href="https://unee-t.com"><img src="cid:logo@unee-t.com"/></a>.
              </td>
            </tr>
          </table>
        </div>
        <!-- END FOOTER -->

      </div>
    </td>
    <td>&nbsp;</td>
  </tr>
</table>
</body>
</html>
`,

  text: `
Hi ${resolveUserName(user)},

${mainContentText}

Follow this link: "${accessUrl}" to see the current status for this case.
Participate in the conversation, add comments or pictures directly so we can resolve this faster.

Regards,
Unee-T
THE Web App to Manage Incidents in your Properties
--
You are receiving this email because you have been assigned to a case.
To Unsubscribe from these type of emails or manage your settings for all type of email updates, go to ${optOutUrl}
  `,
  attachments: [{
    path: 'https://s3-ap-southeast-1.amazonaws.com/prod-media-unee-t/2018-06-14/unee-t_logo_email.png',
    cid: 'logo@unee-t.com'
  }]
})
