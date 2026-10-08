const CHAT_ID = "836194267";
const ALLOWED_ORIGIN = "https://stalnoykontur.ru";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "GET") {
      return new Response(
        "Стальной контур: форма заявок работает.",
        {
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        }
      );
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
      });
    }

    const origin = request.headers.get("Origin");

    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", {
        status: 403,
      });
    }

    try {
      const form = await request.formData();

      const name = form.get("name") || "Не указано";
      const phone = form.get("phone") || "Не указан";
      const construction =
        form.get("construction") || "Не указано";
      const address = form.get("address") || "Не указан";
      const dimensions =
        form.get("dimensions") || "Не указаны";
      const deadline =
        form.get("deadline") || "Не указан";
      const description =
        form.get("description") || "Не указано";

      const message =
`🔩 НОВАЯ ЗАЯВКА С САЙТА «СТАЛЬНОЙ КОНТУР»

👤 Имя: ${name}
📞 Телефон: ${phone}
🏗 Конструкция: ${construction}
📍 Объект: ${address}
📐 Размеры: ${dimensions}
⏱ Срок: ${deadline}

📝 ОПИСАНИЕ:
${description}`;

      const api =
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

      const telegramResponse = await fetch(
        `${api}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
          }),
        }
      );

      if (!telegramResponse.ok) {
        return new Response("Telegram error", {
          status: 502,
        });
      }

      const files = form.getAll("attachment");

      for (const file of files) {
        if (!(file instanceof File) || !file.size) {
          continue;
        }

        const tgForm = new FormData();

        tgForm.append("chat_id", CHAT_ID);
        tgForm.append(
          "document",
          file,
          file.name
        );

        const fileResponse = await fetch(
          `${api}/sendDocument`,
          {
            method: "POST",
            body: tgForm,
          }
        );

        if (!fileResponse.ok) {
          return new Response(
            "File upload error",
            { status: 502 }
          );
        }
      }

      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );

    } catch (error) {
      return new Response(
        "Server error",
        { status: 500 }
      );
    }
  },
};
