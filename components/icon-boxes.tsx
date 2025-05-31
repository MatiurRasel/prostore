import { DollarSign, Headset, ShoppingBag, WalletCards } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const IconBoxes = () => {
    return ( 
        <div className="my-8">
           <Card className="border-none shadow-lg">
            <CardContent className="grid md:grid-cols-4 gap-8 p-8">
                <div className="space-y-3 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-center">
                        <ShoppingBag className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300"/>
                    </div>
                    <div className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Free Shipping
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Free shipping on orders over $100
                    </p>
                </div>

                <div className="space-y-3 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-center">
                        <DollarSign className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300"/>
                    </div>
                    <div className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Money Back Guarantee
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Within 30 days of purchase
                    </p>
                </div>

                <div className="space-y-3 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-center">
                        <WalletCards className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300"/>
                    </div>
                    <div className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Flexible Payment
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Pay with credit card, PayPal, or COD
                    </p>
                </div>

                <div className="space-y-3 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-center">
                        <Headset className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300"/>
                    </div>
                    <div className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        24/7 Support
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Contact us 24/7 for any questions
                    </p>
                </div>
            </CardContent>
           </Card>
        </div>
     );
}
 
export default IconBoxes;