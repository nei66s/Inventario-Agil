import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

export const stripeClient = {
    async createCustomer(email: string, name: string) {
        return await stripe.customers.create({
            email,
            name,
        });
    },

    async createCheckoutSession(customerId: string, tenantId: string) {
        return await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'], // Add 'pix', 'boleto' if needed and available in Brazil
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Assinatura Inventário Ágil',
                            description: 'Ativação de instância e acesso mensal.',
                        },
                        unit_amount: 500, // R$ 5,00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/register?canceled=true`,
            metadata: {
                tenantId,
            },
        });
    },

    async constructEvent(body: string, sig: string) {
        return stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    }
};
