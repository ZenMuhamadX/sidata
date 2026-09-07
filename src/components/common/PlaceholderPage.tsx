import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">{title}</h2>
      </div>

      <div className="section-card placeholder-card">
        <p className="placeholder-text">{description}</p>
      </div>
    </div>
  );
};
