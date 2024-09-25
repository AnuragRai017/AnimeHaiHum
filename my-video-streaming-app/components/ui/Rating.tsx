import React, { useState } from 'react';

interface RatingProps {
  initialRating: number;
  maxStars?: number;
  onValueChange: (newRating: number) => void;
}

const Rating: React.FC<RatingProps> = ({ initialRating, maxStars = 5, onValueChange }) => {
  const [rating, setRating] = useState(initialRating);

  const handleClick = (newRating: number) => {
    setRating(newRating);
    onValueChange(newRating); // Send the new rating to the parent component (to save in the backend)
  };

  return (
    <div className="rating">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span key={starValue} onClick={() => handleClick(starValue)} className="cursor-pointer">
            {starValue <= rating ? '★' : '☆'} {/* Filled star or empty star */}
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
