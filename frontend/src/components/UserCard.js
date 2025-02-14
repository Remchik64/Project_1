import React from 'react';

const UserCard = ({ user }) => {
    return (
        <div className="user-card">
            <img src={user.photo} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.age} лет</p>
            {/* Можно добавить дополнительные данные, например, город или интересы */}
        </div>
    );
};

export default UserCard; 