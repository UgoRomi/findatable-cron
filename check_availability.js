import dotenv from 'dotenv';
import { format, add } from 'date-fns';
import nodemailer from 'nodemailer';
dotenv.config();

const checkAvailability = async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    auth: {
      user: 'ugo.romi@icloud.com',
      pass: process.env.APP_PASSWORD,
    },
  });
  const today = new Date();
  const formattedFrom = format(today, 'yyyy-M-dd');

  const to = add(today, { months: 7 });
  const formattedTo = format(to, 'yyyy-M-dd');

  console.log(`Checking availability from ${formattedFrom} to ${formattedTo}`);

  const url = `https://api.rsvp-popup.com/api/public/restaurants/2906/availability?seats=2&from=${formattedFrom}&to=${formattedTo}`;
  const body = await (await fetch(url)).json();
  const availableDays = body.filter((day) => day.IsSoldOut === false);
  console.log(`Found ${availableDays.length} available days`);

  for (const availableDay of availableDays) {
    transporter.sendMail({
      from: 'ugo.romi@icloud.com',
      to: 'ugo.romi@icloud.com',
      subject: `POSTI DISPONIBILI PRESSO OSTERIA FRANCESCANA IL GIORNO ${availableDay.Date.toLocaleDateString()}`,
      text: 'per prenotare vai su https://reservations.osteriafrancescana.it/',
      html: '<p>per prenotare vai su <a href="https://reservations.osteriafrancescana.it/">https://reservations.osteriafrancescana.it/</a></p>',
    });
  }

  transporter.close();
};

checkAvailability();
