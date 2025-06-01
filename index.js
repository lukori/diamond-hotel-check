import fetch from 'node-fetch';
import { chromium } from 'playwright';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const URL = 'https://www.booking.com/hotel/th/diamond-beach-bungalow.html?checkin=2025-08-10&checkout=2025-08-13&group_adults=2&group_children=2&age=9&age=12&no_rooms=1';

async function notifyTelegram(message) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
}

async function checkAvailability() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });

  const content = await page.textContent('body');

  if (!content.includes('Sold out') && !content.includes('No availability')) {
    await notifyTelegram('✅ Rooms available at Diamond Beach Bungalow (Aug 10–13)! Check now: ' + URL);
  } else {
    console.log('No rooms available at this time.');
  }

  await browser.close();
}

checkAvailability();
