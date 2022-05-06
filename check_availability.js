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
  console.log(`calling ${url}`);
  const body = await (await fetch(url)).json();
  const availableDays = body.filter((day) => day.Status === 'AVAILABLE');
  console.log(`Found ${availableDays.length} available days`);

  if (availableDays.length > 0) {
    let emailSubject = '';
    for (const availableDay of availableDays) {
      emailSubject += `${new Date(availableDay.Date).toLocaleDateString(
        'it-IT'
      )} `;
    }
    transporter.sendMail({
      from: 'ugo.romi@icloud.com',
      to: 'ugo.romi@icloud.com',
      subject: `POSTI DISPONIBILI PRESSO OSTERIA FRANCESCANA IL/I GIORNO/I ${emailSubject}`,
      text: 'per prenotare vai su https://reservations.osteriafrancescana.it/',
      html: '<p>per prenotare vai su <a href="https://reservations.osteriafrancescana.it/">https://reservations.osteriafrancescana.it/</a></p>',
    });
  }

  transporter.close();
	console.log("done")
};

checkAvailability();
