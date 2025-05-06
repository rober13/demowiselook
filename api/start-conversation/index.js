import fetch from 'node-fetch';

export default async function (context, req) {
  try {
    // Usar replicaId del request o el valor predeterminado de las variables de entorno
    const requestBody = JSON.parse(req.body || '{}');
    const replicaId = requestBody.replicaId || process.env.DEFAULT_REPLICA_ID;
    
    if (!replicaId) {
      context.log.error("No se proporcionó replica ID");
      return {
        status: 400,
        body: JSON.stringify({ error: "Se requiere un replica ID" })
      };
    }

    const resp = await fetch('https://api.tavus.io/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TAVUS_API_KEY}`
      },
      body: JSON.stringify({
        replica_id: replicaId
      })
    });

    if (!resp.ok) {
      throw new Error(`Error en la API de Tavus: ${resp.status}`);
    }

    const data = await resp.json();
    return {
      status: 200,
      body: JSON.stringify({ url: data.conversation_url })
    };
  } catch (error) {
    context.log.error("Error al iniciar conversación:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Error al iniciar la conversación" })
    };
  }
}
