import dotenv from "dotenv";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  isFriday,
  isSaturday,
  addDays,
} from "date-fns";
import nodemailer from "nodemailer";
dotenv.config();

// Add this function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkAvailability = async () => {
  const transporter = nodemailer.createTransport({
    service: "icloud",
    auth: {
      user: "ugo.romi@icloud.com",
      pass: process.env.APP_PASSWORD,
    },
  });
  const today = new Date();
  const to = new Date(2024, 11, 1); // 1 Nov 2023

  console.log(
    `Checking availability from ${format(today, "yyyy-MM-dd")} to ${format(
      to,
      "yyyy-MM-dd"
    )}`
  );

  const availableDays = [];
  let currentMonth = startOfMonth(today);

  while (currentMonth <= to) {
    const url = "https://www.covermanager.com/reservation/highlight";
    console.log(`Checking month: ${format(currentMonth, "yyyy-MM")}`);

    const formData = new URLSearchParams();
    formData.append("language", "italian");
    formData.append("restaurant", "restaurante-osteriafrancescana");
    formData.append("month", format(currentMonth, "M"));
    formData.append("year", format(currentMonth, "yyyy"));
    formData.append("vip", "0");
    formData.append("skip_blocked_tables", "false");
    formData.append("people", "2");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const body = await response.json();

    // Check availability for Fridays and Saturdays in the current month
    const monthEnd = endOfMonth(currentMonth);
    let checkDate = currentMonth;
    while (checkDate <= monthEnd && checkDate <= to) {
      if (
        (isFriday(checkDate) || isSaturday(checkDate)) &&
        checkDate >= today
      ) {
        const dateToCheck = format(checkDate, "yyyy-MM-dd");
        if (body[dateToCheck] && body[dateToCheck][1] !== "complete") {
          availableDays.push(dateToCheck);
        }
      }
      checkDate = addDays(checkDate, 1);
    }

    currentMonth = addMonths(currentMonth, 1);

    // Add a 3-second delay before the next request
    await delay(300);
  }

  console.log(`Found ${availableDays.length} available days`);

  if (availableDays.length > 0) {
    let emailSubject = availableDays
      .map((day) => format(new Date(day), "dd/MM/yyyy"))
      .join(", ");

    transporter.sendMail({
      from: "ugo.romi@icloud.com",
      to: "ugo.romi@gmail.com",
      subject: `POSTI DISPONIBILI PRESSO OSTERIA FRANCESCANA IL/I GIORNO/I ${emailSubject}`,
      text: "per prenotare vai su https://reservations.osteriafrancescana.it/",
      html: '<p>per prenotare vai su <a href="https://reservations.osteriafrancescana.it/">https://reservations.osteriafrancescana.it/</a></p>',
    });
  }
  transporter.close();
  console.log("done");
  return;
};

checkAvailability();
