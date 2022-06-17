import 'dotenv/config'
import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const message = await client.messages.create({
    body: 'This is the THIRD ship that made the Kessel Run in fourteen parsecs?',
    from: process.env.TWILIO_ORIGIN_NBR,
    to: process.env.TWILIO_TARGET_NBR
});
console.log(message.sid)

