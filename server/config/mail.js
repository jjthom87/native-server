var nodemailer = require('nodemailer')

exports.send = (recipient, subject, html) => {
  var transporter = nodemailer.createTransport({
  	host: process.env.EMAIL_HOST,
  	port: 465,
  	secure: true,
  	auth: {
  		user: process.env.EMAIL_ADMIN,
  		pass: process.env.EMAIL_PASS
  	}
  });
  var mailOptions = {
  		from: process.env.EMAIL_ADMIN,
  		subject: subject,
  		to: recipient,
      html: html
  };
  transporter.sendMail(mailOptions, function(mailError, mailInfo){
  		if(mailError){
  				throw new Error(mailError);
  		}
      console.log("mail sent")
  });
}
