/**
 * Meta Conversions API (CAPI) - Envio de eventos server-side
 *
 * Envia eventos duplicados pelo servidor para complementar o Pixel client-side.
 * Isso garante que eventos sejam capturados mesmo com bloqueadores de anuncios.
 */

const https = require('https');
const crypto = require('crypto');

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const API_VERSION = 'v21.0';

/**
 * Envia evento para a Meta Conversions API
 * @param {string} eventName - Nome do evento (PageView, Lead, Contact, etc)
 * @param {object} req - Express request (para extrair IP e User Agent)
 * @param {object} userData - Dados do usuario (email, phone, etc) - opcionais
 * @param {object} customData - Dados customizados do evento
 */
async function sendEvent(eventName, req, userData = {}, customData = {}) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('Meta CAPI: PIXEL_ID ou ACCESS_TOKEN nao configurados');
    return;
  }

  try {
    const eventData = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: req ? `${req.protocol}://${req.get('host')}${req.originalUrl}` : undefined,
        action_source: 'website',
        user_data: {
          client_ip_address: req ? (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress) : undefined,
          client_user_agent: req ? req.headers['user-agent'] : undefined,
          ...(userData.email ? { em: [hashData(userData.email.toLowerCase().trim())] } : {}),
          ...(userData.phone ? { ph: [hashData(userData.phone)] } : {})
        },
        custom_data: Object.keys(customData).length > 0 ? customData : undefined
      }]
    };

    // Remover campos undefined
    const eventEntry = eventData.data[0];
    Object.keys(eventEntry).forEach(k => eventEntry[k] === undefined && delete eventEntry[k]);
    Object.keys(eventEntry.user_data).forEach(k => eventEntry.user_data[k] === undefined && delete eventEntry.user_data[k]);

    const postData = JSON.stringify(eventData);

    const options = {
      hostname: 'graph.facebook.com',
      path: `/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve) => {
      const request = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`Meta CAPI: ${eventName} enviado com sucesso`);
          } else {
            console.warn(`Meta CAPI: erro ${res.statusCode} - ${body}`);
          }
          resolve();
        });
      });

      request.on('error', (err) => {
        console.warn(`Meta CAPI: erro de rede - ${err.message}`);
        resolve();
      });

      request.write(postData);
      request.end();
    });
  } catch (err) {
    console.warn(`Meta CAPI: erro ao enviar ${eventName} - ${err.message}`);
  }
}

/**
 * Hash SHA256 para dados pessoais (exigido pela Meta)
 */
function hashData(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Helpers para eventos especificos
const sendPageView = (req) => sendEvent('PageView', req);
const sendContact = (req) => sendEvent('Contact', req);
const sendLead = (req, clientName) => sendEvent('Lead', req, {}, { content_name: clientName });
const sendSubscribe = (req, email) => sendEvent('Subscribe', req, { email });
const sendCompleteRegistration = (req, clientName, value) => sendEvent('CompleteRegistration', req, {}, { content_name: clientName, value, currency: 'BRL' });

module.exports = {
  sendEvent,
  sendPageView,
  sendContact,
  sendLead,
  sendSubscribe,
  sendCompleteRegistration
};
