const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

export const paypal = {
    createOrder: async function createOrder(price: number) {
        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await generateAccessToken()}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: price,
                        },
                    },
                ],
            }),
        });
       
        return handleResponse(response);
    },
    capturePayment: async function capturePayment(orderId: string) {
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await generateAccessToken()}`,
            },
        });
        return handleResponse(response);
    }
};

//Generate the access token
async function generateAccessToken() {
    const {PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET} = process.env;

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString('base64');
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
        },
    });

    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}

async function handleResponse(response: Response) {
    if (response.ok) {
        return response.json();
    } else {
        const errorMessage = await response.text();
        throw new Error(`Error creating order: ${errorMessage}`);
    }
}

export { generateAccessToken };