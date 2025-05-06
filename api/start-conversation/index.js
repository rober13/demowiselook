import fetch from 'node-fetch';

export default async function (context, req) {
  const { replicaId } = JSON.parse(req.body || '{}');

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

  const data = await resp.json();
  // data.conversation_url contiene la sala WebRTC
  return {
    status: 200,
    body: JSON.stringify({ url: data.conversation_url })
  };
}
