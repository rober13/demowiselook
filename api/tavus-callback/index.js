module.exports = async function (context, req) {
  try {
    const eventData = req.body;
    
    // Registrar el evento recibido de Tavus
    context.log.info("Evento de webhook Tavus recibido:", JSON.stringify(eventData));
    
    // Aquí puedes procesar diferentes tipos de eventos
    // Por ejemplo, guardar datos de la conversación en una base de datos
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { status: "received" }
    };
  } catch (error) {
    context.log.error("Error procesando webhook de Tavus:", error);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Error procesando el webhook" }
    };
  }
};