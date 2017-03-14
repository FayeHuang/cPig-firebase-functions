var functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// firebase functions:config:set gmail.email="<E-mail>" gmail.password="<Password>"
const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(
    `smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

exports.sendAuthCodeToManager = functions.database.ref('/communities/{communityId}/apply_info')
  .onWrite(event => {
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      console.log(`${event.params.communityId} apply_info did not exists.`);
      return;
    }
    
    const applyInfo = event.data.val();
    if (!applyInfo.pass) {
      console.log('apply did not pass');
      return;
    }
      
    // Grab the current value of what was written to the Realtime Database.
    const authorizeCode = applyInfo.authorize_code;
    const applyEmail = applyInfo.email;

    return sendAuthorizeCodeEmail(applyEmail, authorizeCode);
});
    

// Sends a authorize_code email to the given user.
function sendAuthorizeCodeEmail(email, authorizeCode) {
  const mailOptions = {
    from: '"Community Pig" <noreply@firebase.com>',
    to: email
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Your Authorize Code for Community Pig !`;
  mailOptions.text = `請用授權碼 "${authorizeCode}" 至 Community Pig 註冊頁面註冊您的帳號。`;
  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('New authorize code email sent to:', email);
  });
}
