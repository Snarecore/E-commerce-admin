import React from 'react';
import Button from '../buttons/ButtonStyleOne';

interface EmptyStateProps {
    title: string;
    description?: string;
    image?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    image = "/images/empty-box.svg",
    buttonText,
    onButtonClick
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <img src={image} alt="No Data" className="w-40 h-40" />
            {title && (
                <p className="text-gray-500 text-lg">{title}</p>
            )}
            {description && (
                <p className="text-gray-400 text-sm">{description}</p>
            )}
            {buttonText && onButtonClick && (
                <div className='mt-2'>
                    <Button
                        label={buttonText}
                        onClick={onButtonClick}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                    />
                </div>
            )}
        </div>
    );
};

export default EmptyState;
