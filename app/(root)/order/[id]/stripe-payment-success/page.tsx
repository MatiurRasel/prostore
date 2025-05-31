import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import { CheckCircle2, ArrowRight } from "lucide-react";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const SuccessPage = async (
props: {
    params: Promise<{id: string}>;
    searchParams: Promise<{payment_intent: string}>;
}    
) => {

    const {id} = await props.params;
    const {payment_intent: paymentIntentId} = await props.searchParams;

  //Fetch the order
  const order = await getOrderById(id);

  if(!order) notFound();

  //Retrieve the payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  //check if payment is valid
  if(paymentIntent.metadata.orderId == null || paymentIntent.metadata.orderId !== order.id.toString()) notFound();

  //check if payment is successful
  const isSuccess = paymentIntent.status === "succeeded";

  if(!isSuccess) {
    return redirect(`/order/${id}`);  
}
  

    return ( 
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-4xl w-full mx-auto p-8 space-y-8 bg-card rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col gap-8 items-center text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative w-24 h-24 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle2 className="w-14 h-14 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Payment Successful!</h1>
                        <p className="text-lg text-muted-foreground max-w-md">
                            Thank you for your purchase. We are processing your order and will notify you once it's ready.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Button asChild size="lg" className="group">
                            <Link href={`/order/${id}`} className="flex items-center gap-2">
                                View Order
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default SuccessPage;