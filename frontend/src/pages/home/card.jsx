import React from 'react';
import './Card.css';

const Card = ({ title, description }) => {
  return (
    <div className="card1">
      <div className="card-content1">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;