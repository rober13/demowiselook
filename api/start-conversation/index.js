module.exports = async function (context, req) {
  try {
    // Obtener replicaId del request o usar el valor por defecto
    const requestBody = req.body || {};
    const replicaId = requestBody.replicaId || process.env.DEFAULT_REPLICA_ID;
    const personaId = requestBody.personaId || process.env.DEFAULT_PERSONA_ID; // NUEVO
    
    if (!replicaId) {
      context.log.error("No se proporcionó replica ID");
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: { error: "Se requiere un replica ID" }
      };
      return;
    }

    // Importación dinámica de fetch (recomendada para Azure Functions)
    const fetch = (await import('node-fetch')).default;
    
    // Construir la URL de callback basada en la request
    const host = req.headers.host || 'proud-grass-073de1603.6.azurestaticapps.net';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const callbackUrl = `${protocol}://${host}/api/tavus-callback`;
    
    // Preparar payload para Tavus API con parámetros adicionales
    const payload = {
      replica_id: replicaId,
      persona_id: personaId, // NUEVO
      callback_url: callbackUrl,
      properties: {
        max_call_duration: 1800, // 30 minutos
        enable_recording: true,
        enable_closed_captions: true,
        language: "spanish"
      }
    };

    // Llamada a la API de Tavus
    const resp = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.TAVUS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      context.log.error(`Error en la API de Tavus: ${resp.status}`, errorData);
      context.res = {
        status: resp.status,
        headers: { "Content-Type": "application/json" },
        body: { error: `Error en la API de Tavus: ${resp.status}` }
      };
      return;
    }

    const data = await resp.json();
    context.log.info("Conversación creada exitosamente:", data.conversation_id);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { 
        url: data.conversation_url,
        conversation_id: data.conversation_id
      }
    };
  } catch (error) {
    context.log.error("Error al iniciar conversación:", error);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Error al iniciar la conversación" }
    };
  }
};
