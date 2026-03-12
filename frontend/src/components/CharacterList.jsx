import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import './CharacterList.css';

const CharacterList = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const data = await apiService.get('/characters');
                setCharacters(data);
            } catch (err) {
                console.error("Failed to fetch characters:", err);
                setError(err.message || 'Failed to load characters');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    if (loading) {
        return <div className="container"><h2>Loading characters...</h2></div>;
    }

    if (error) {
        return <div className="container"><h2>Error: {error}</h2></div>;
    }

    return (
        <div className="container">
            <div className="page-header">
                <h2>Your Characters</h2>
                <Link to="/create/character" className="btn btn-primary">Create New Hero</Link>
            </div>

            {characters.length === 0 ? (
                <div className="card empty-state">
                    <p>No characters found. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid-select">
                    {characters.map((char) => (
                        <Link to={`/character/${char.id}`} key={char.id} className="card selectable-card character-list-item">
                            <div className="avatar">
                                {char.char_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="avatar-title">{char.char_name}</h3>
                                <div className="text-muted-sm">
                                    Level {char.total_level} • HP {char.total_hp}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CharacterList;
