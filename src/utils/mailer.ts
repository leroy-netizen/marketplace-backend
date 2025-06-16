import nodemailer from "nodemailer";

export const sendOTPEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"Marketplace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail(mailOptions);
};
