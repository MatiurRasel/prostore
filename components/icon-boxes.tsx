'use client';

import { MotionDiv } from '@/components/ui/motion';
import { Truck, Shield, CreditCard, RefreshCw } from 'lucide-react';

const IconBoxes = () => {
    const features = [
        {
            icon: <Truck className="h-6 w-6" />,
            title: 'Free Shipping',
            description: 'Free shipping on all orders over $50'
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: 'Secure Payment',
            description: 'We ensure secure payment with SSL'
        },
        {
            icon: <CreditCard className="h-6 w-6" />,
            title: 'Money Back',
            description: '30 days money back guarantee'
        },
        {
            icon: <RefreshCw className="h-6 w-6" />,
            title: 'Easy Returns',
            description: 'Simple and hassle-free returns'
        }
    ];

    return (
        <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <MotionDiv
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="mb-4 text-primary">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default IconBoxes;