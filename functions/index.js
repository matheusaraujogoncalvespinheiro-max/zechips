const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Inicializa o Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// API do Mercado Pago
const MP_API_URL = 'https://api.mercadopago.com';

/**
 * Função para criar a preferência de pagamento no Mercado Pago.
 * É chamada pelo frontend do cliente.
 */
exports.createPreference = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Método não permitido. Use POST.' });
        }

        try {
            const { order } = req.body;
            if (!order || !order.items || !order.code) {
                return res.status(400).json({ error: 'Pedido inválido ou incompleto.' });
            }

            const accessToken = process.env.MP_ACCESS_TOKEN;
            if (!accessToken) {
                return res.status(500).json({ error: 'Token do Mercado Pago não configurado no servidor (.env).' });
            }

            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const projectId = process.env.GCLOUD_PROJECT;
            // O webhook aponta para a nossa função mpWebhook
            const webhookUrl = process.env.WEBHOOK_URL || `https://us-central1-${projectId}.cloudfunctions.net/mpWebhook`;

            // Mapear itens do carrinho para o formato do Mercado Pago
            const items = order.items.map(item => ({
                title: item.name,
                quantity: Number(item.qty),
                unit_price: Number(item.price),
                currency_id: 'BRL'
            }));

            // Calcular subtotal e adicionar taxa de entrega se necessário
            const subtotal = order.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
            if (order.total > subtotal) {
                items.push({
                    title: 'Taxa de Entrega',
                    quantity: 1,
                    unit_price: Number((order.total - subtotal).toFixed(2)),
                    currency_id: 'BRL'
                });
            }

            // Montar preferência de pagamento (Checkout Pro)
            const preferenceBody = {
                items: items,
                external_reference: order.code, // Código do pedido para o Webhook identificar
                back_urls: {
                    success: `${baseUrl}/feedback.html?status=success&code=${encodeURIComponent(order.code)}`,
                    failure: `${baseUrl}/feedback.html?status=failure&code=${encodeURIComponent(order.code)}`,
                    pending: `${baseUrl}/feedback.html?status=pending&code=${encodeURIComponent(order.code)}`
                },
                auto_return: 'approved',
                notification_url: webhookUrl
            };

            // Criar preferência na API do Mercado Pago
            const response = await fetch(`${MP_API_URL}/v1/preferences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferenceBody)
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error('Erro na API do Mercado Pago:', errData);
                throw new Error('Falha ao gerar preferência no Mercado Pago');
            }

            const data = await response.json();

            // Retorna o init_point (URL para redirecionar o cliente)
            return res.status(200).json({
                preferenceId: data.id,
                init_point: data.init_point
            });

        } catch (error) {
            console.error('Erro ao criar preferência:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

/**
 * Webhook que recebe notificações automáticas do Mercado Pago
 * quando o pagamento é concluído pelo cliente.
 */
exports.mpWebhook = functions.https.onRequest(async (req, res) => {
    // Retorna 200 ok de imediato para o Mercado Pago não reenviar a notificação
    res.status(200).send('OK');

    try {
        console.log('Notificação recebida do Mercado Pago:', req.body, req.query);

        // O Mercado Pago notifica alterações via query string (data.id) ou body (resource ou data.id)
        const paymentId = req.query['data.id'] || (req.body.data && req.body.data.id);
        const action = req.body.action || req.query.topic;

        // Só processamos notificações de pagamento
        if (!paymentId || (action && action !== 'payment.created' && action !== 'payment.updated' && action !== 'payment')) {
            console.log('Notificação ignorada (não é de pagamento).');
            return;
        }

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('Erro: MP_ACCESS_TOKEN não está configurado.');
            return;
        }

        // Consultar detalhes do pagamento no Mercado Pago
        const paymentResponse = await fetch(`${MP_API_URL}/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!paymentResponse.ok) {
            console.error(`Erro ao consultar pagamento ${paymentId} no Mercado Pago.`);
            return;
        }

        const payment = await paymentResponse.json();
        const orderCode = payment.external_reference;
        const status = payment.status;

        console.log(`Pagamento ${paymentId} para o Pedido ${orderCode} está com status: ${status}`);

        // Se o pagamento foi aprovado, atualizamos o Firestore
        if (status === 'approved' && orderCode) {
            const orderRef = db.collection('orders').doc(orderCode);
            const orderDoc = await orderRef.get();

            if (orderDoc.exists) {
                // Atualiza o pedido para Pago e inicia a produção (status: Preparando)
                await orderRef.update({
                    paid: true,
                    status: 'Preparando',
                    paymentId: paymentId
                });
                console.log(`Pedido ${orderCode} atualizado com sucesso no Firestore.`);
            } else {
                console.error(`Erro: Pedido ${orderCode} não encontrado no Firestore.`);
            }
        }

    } catch (error) {
        console.error('Erro no processamento do Webhook:', error);
    }
});
