'use client';

import Image from "next/image";
import loader from '@/assets/loader.gif';

const LoadingPage = () => {
    return (
        <>
            <style jsx global>{`
                @keyframes pulse_6784 {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.7;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .dot-pulse_6784 {
                    animation: pulse_6784 1.4s infinite ease-in-out both;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    margin: 0 6px;
                }
                .dot-pulse_6784:nth-child(1) {
                    background-color: #60A5FA;
                    animation-delay: -0.32s;
                }
                .dot-pulse_6784:nth-child(2) {
                    background-color: #34D399;
                    animation-delay: -0.16s;
                }
                .dot-pulse_6784:nth-child(3) {
                    background-color: #A78BFA;
                }
            `}</style>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
                backgroundColor: 'rgba(255, 255, 255, 0.95)' /* Optional: slight overlay */
            }}>
                <div className="dot-pulse_6784"></div>
                <div className="dot-pulse_6784"></div>
                <div className="dot-pulse_6784"></div>
            </div>
        </>
    );
}
 
export default LoadingPage;