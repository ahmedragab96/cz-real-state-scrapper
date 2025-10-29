import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateListingsEmail } from "./emailTemplate";
import { RegionListings } from "../scrapers/types";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendEmail(data: RegionListings) {
  const html = generateListingsEmail(data);

  await transporter.sendMail({
    from: `"Czech Houses Watcher" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: "🏡 New Listings in Czech Regions 🏡",
    html,
  });

  console.log("✅ Email sent");
}