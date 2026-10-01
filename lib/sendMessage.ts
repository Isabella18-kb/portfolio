// Envío del formulario de contacto a mi correo con Web3Forms.
// La clave se consigue gratis en web3forms.com con el email donde llegan los mensajes. Puede estar a la
// vista: solo sirve para mandar mensajes a ese email.
const WEB3FORMS_KEY = "737aa457-2d9c-4d8c-9560-d4f84b4eea11";

export type Message = { name: string; company: string; email: string; topic: string; message: string };

// Devuelve null si ha ido bien, o el motivo del error
export async function sendMessage({ name, company, email, topic, message }: Message): Promise<string | null> {
  const from = company ? `${name} (${company})` : name;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `${topic} — ${from} (desde el portfolio)`,
        from_name: "Portfolio",
        replyto: email, // al pulsar "Responder" en Gmail, la respuesta va a quien escribió
        nombre: name,
        empresa: company || "—",
        email,
        motivo: topic,
        mensaje: message,
      }),
    });
    const json = await res.json();
    return json.success ? null : (json.message ?? "El servidor rechazó el mensaje");
  } catch {
    return "Sin conexión con el servidor";
  }
}
