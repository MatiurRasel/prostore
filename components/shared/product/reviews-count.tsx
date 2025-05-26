import { Badge } from "@/components/ui/badge";

interface ReviewsCountProps {
    count: number;
    className?: string;
}

const ReviewsCount = ({ count, className = "" }: ReviewsCountProps) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Badge variant="secondary" className="flex items-center gap-1">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-message-square"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {count} {count === 1 ? 'Review' : 'Reviews'}
            </Badge>
        </div>
    );
};

export default ReviewsCount; 