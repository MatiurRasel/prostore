'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MotionDiv } from '@/components/ui/motion';

//Static target date(replace with dynamic date)
const TARGET_DATE = new Date('2026-01-01T00:00:00');

//Function to calculate the time remaining until the target date
const calculateTimeRemaining = (targetDate: Date) => {
    const currentTime = new Date();
    const timeDifference = Math.max(Number(targetDate)-Number(currentTime), 0);
    return {
        days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
            (timeDifference % (1000 * 60 * 60 *24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        ),
        seconds: Math.floor(
            (timeDifference % (1000 * 60)) / 1000
        ),
    };
}

const DealCountdown = () => {
    const[time,setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

    useEffect(() => {
        //Calcule Initial Time on client
            setTime(calculateTimeRemaining(TARGET_DATE));
            const timerInterval = setInterval(() => {
                const newTime = calculateTimeRemaining(TARGET_DATE);
                setTime(newTime);

                //Stop timer if target date is reached
                if(newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
                    clearInterval(timerInterval);
                }

                return () => clearInterval(timerInterval);
            }, 1000);
    }, []);

    if(!time) {
        return (
            <section className="grid grid-cols-1 md:grid-cols-2 my-10 md:my-20 gap-6 md:gap-8 items-center px-4 md:px-0">
                <div className="flex flex-col gap-4 justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse">Loading Countdown...</h3>
                </div>
            </section>
        );
    }

    if(time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
        return ( 
            <section className="grid grid-cols-1 md:grid-cols-2 my-10 md:my-20 gap-6 md:gap-8 items-center px-4 md:px-0">
                <MotionDiv 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-4 justify-center order-2 md:order-1"
                >
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Deal has ended</h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                        This deal has ended. Check back soon for a new deal!
                    </p>
                    
                    <div className="text-center mt-4">
                        <Button asChild size="lg" className="rounded-full w-full md:w-auto hover:scale-105 transition-transform">
                            <Link href='/search'>
                               View Products
                            </Link>
                        </Button>
                    </div>
                </MotionDiv>
                <MotionDiv 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center order-1 md:order-2"
                >
                    <Image
                        src="/images/promo.jpg" 
                        alt="promotion" 
                        width={400} 
                        height={300}
                        className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-[300px] md:max-w-[400px] h-auto hover:scale-[1.02]"
                    />
                </MotionDiv>
            </section>
         );
    }

    return ( 
        <section className="grid grid-cols-1 md:grid-cols-2 my-10 md:my-20 gap-6 md:gap-8 items-center px-4 md:px-0">
            <MotionDiv 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4 justify-center order-2 md:order-1"
            >
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Deal Of The Month</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                    Get ready for a shopping experience like never before with our Deals
                    of the Month! Every purchase comes with exclusive perks and offers,
                    making this month a celebration of savvy choices and amazing deals.
                    Don&apos;t miss out! 🎁🛒
                </p>
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-4">
                    <StatBox label="Days" value={time.days}/>
                    <StatBox label="Hours" value={time.hours}/>
                    <StatBox label="Minutes" value={time.minutes}/>
                    <StatBox label="Seconds" value={time.seconds}/>
                </ul>
                <div className="text-center mt-4">
                    <Button asChild size="lg" className="rounded-full w-full md:w-auto hover:scale-105 transition-transform">
                        <Link href='/search'>
                           View Products
                        </Link>
                    </Button>
                </div>
            </MotionDiv>
            <MotionDiv 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center order-1 md:order-2"
            >
                <Image
                    src="/images/promo.jpg" 
                    alt="promotion" 
                    width={400} 
                    height={300}
                    className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-[300px] md:max-w-[400px] h-auto hover:scale-[1.02]"
                />
            </MotionDiv>
        </section>
     );
};
 
const StatBox = ({label, value}: {label: string, value: number}) => (
    <MotionDiv 
        whileHover={{ scale: 1.05 }}
        className="p-3 md:p-4 w-full text-center bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300"
    >
        <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{value}</p>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{label}</p>
    </MotionDiv>
);

export default DealCountdown;

