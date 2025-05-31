import { updateOrderToPaid } from "@/lib/actions/order.actions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
    //Build the webhook event
    const event =await Stripe.webhooks.constructEventAsync(
        await request.text(),
        request.headers.get('stripe-signature')!,
        process.env.STRIPE_WEBHOOK_SECRET as string
    );

    //Check For Successful Payment
    if(event.type === 'charge.succeeded') {
        const {object} = event.data;

        //Update the order to paid
        await updateOrderToPaid({
            orderId: object.metadata.orderId,
            paymentResult: {
                id: object.id,
                status: "COMPLETED",
                email_address: object.billing_details.email!,
                pricePaid: (object.amount / 100).toFixed(),
            }
                
        });

        return NextResponse.json({
            message: 'Update Order to Paid was successful',

        }, {status: 200});
    }

    return NextResponse.json({
        message: 'event is not a charge.succeeded event',
    }, {status: 400});
}

