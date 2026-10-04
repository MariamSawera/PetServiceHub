import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

const sendNotificationEmail = async ({ email, name, title, message }) => {
  const mailer = getTransporter();
  if (!mailer || !email) return false;

  await mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: title,
    html: `<p>Hello ${name || "there"},</p><p>${message}</p><p>Open PetServiceHub to view more details.</p>`,
  });

  return true;
};

export default sendNotificationEmail;
