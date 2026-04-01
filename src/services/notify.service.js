// notify.service.js
import axios from "axios";
import { config } from "../config.js";

export const sendTelegram = async (message) => {
  await axios.post(
    `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
    {
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: "HTML",
    }
  );
};