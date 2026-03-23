import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import characterController from '../controllers/CharacterController';
import Character from '../models/Character';
import './CharacterDisplay.css';

const STAT_CONFIG = {
    totalLevel: { label: 'Level', min: 1, max: 20 },
    totalHp: { label: 'HP', min: 1, max: 9999 },
    strength: { label: 'STR', min: 1, max: 30 },
    dexterity: { label: 'DEX', min: 1, max: 30 },
    constitution: { label: 'CON', min: 1, max: 30 },
    intelligence: { label: 'INT', min: 1, max: 30 },
    wisdom: { label: 'WIS', min: 1, max: 30 },
    charisma: { label: 'CHA', min: 1, max: 30 },
};

const ABILITY_KEYS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

function CharacterDisplay() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editing, setEditing] = useState(false);
    const [editStats, setEditStats] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        fetchCharacter();
    }, [id]);

    const fetchCharacter = async () => {
        try {
            setLoading(true);
            setError(null);
            const char = await characterController.getCharacter(id);
            setCharacter(char);
        } catch (err) {
            setError(err.message || 'Failed to fetch character');
            console.error('Error fetching character:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate('/');

    const startEditing = () => {
        setEditStats({
            totalLevel: character.totalLevel,
            totalHp: character.totalHp,
            strength: character.strength,
            dexterity: character.dexterity,
            constitution: character.constitution,
            intelligence: character.intelligence,
            wisdom: character.wisdom,
            charisma: character.charisma,
        });
        setSaveError(null);
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setSaveError(null);
    };

    const adjustStat = (key, delta) => {
        setEditStats(prev => {
            const { min, max } = STAT_CONFIG[key];
            const clamped = Math.min(max, Math.max(min, prev[key] + delta));
            return { ...prev, [key]: clamped };
        });
    };

    const handleSubmit = async () => {
        const preview = new Character({ ...character, ...editStats });
        const { isValid, errors } = preview.validate();
        if (!isValid) {
            setSaveError(errors.join(', '));
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            const payload = {
                total_level: editStats.totalLevel,
                total_hp: editStats.totalHp,
                strength: editStats.strength,
                dexterity: editStats.dexterity,
                constitution: editStats.constitution,
                intelligence: editStats.intelligence,
                wisdom: editStats.wisdom,
                charisma: editStats.charisma,
            };
            const updated = await characterController.updateCharacter(id, payload);
            setCharacter(updated);
            setEditing(false);
        } catch (err) {
            setSaveError(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container loading-state">
                <p>Loading character...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container card error-state">
                <h2 className="error-text">Error Loading Character</h2>
                <p>{error}</p>
                <button onClick={fetchCharacter} className="btn btn-outline margin-top-sm">
                    Retry
                </button>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="container empty-state-display">
                <p>No character found</p>
            </div>
        );
    }

    const displayStats = editing ? editStats : character;
    const modifiers = {
        strength: Character.getModifier(displayStats.strength),
        dexterity: Character.getModifier(displayStats.dexterity),
        constitution: Character.getModifier(displayStats.constitution),
        intelligence: Character.getModifier(displayStats.intelligence),
        wisdom: Character.getModifier(displayStats.wisdom),
        charisma: Character.getModifier(displayStats.charisma),
    };

    const formatModifier = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const StatAdjuster = ({ statKey }) => {
        const { label, min, max } = STAT_CONFIG[statKey];
        const value = editStats[statKey];
        return (
            <div className="stat-adjuster">
                <button
                    className="btn-icon"
                    onClick={() => adjustStat(statKey, -1)}
                    disabled={value <= min || saving}
                    aria-label={`Decrease ${label}`}
                >-</button>
                <span className="stat-value">{value}</span>
                <button
                    className="btn-icon"
                    onClick={() => adjustStat(statKey, 1)}
                    disabled={value >= max || saving}
                    aria-label={`Increase ${label}`}
                >+</button>
            </div>
        );
    };

    return (
        <div className="container">
            <button onClick={handleBack} className="btn btn-outline margin-bottom-md">
                &larr; Back to Characters
            </button>

            <div className="card margin-bottom-md">
                <div className="character-header-row">
                    <div>
                        <h1 className="margin-bottom-sm">{character.charName}</h1>
                        <div className="stats-summary">
                            <span className="flex-center">
                                <strong>Level {displayStats.totalLevel}</strong>
                                {editing && <StatAdjuster statKey="totalLevel" />}
                            </span>
                            <span className="flex-center">
                                <strong>HP: {displayStats.totalHp}</strong>
                                {editing && <StatAdjuster statKey="totalHp" />}
                            </span>
                            <span><strong>Init: {formatModifier(character.initiativeBonus)}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="margin-bottom-lg">
                    <h2 className="step-title">Ability Scores</h2>
                    <div className="abilities-grid">
                        {ABILITY_KEYS.map(key => (
                            <div className="card ability-card" key={key}>
                                <div className="ability-label">{STAT_CONFIG[key].label}</div>
                                <div className="ability-score">{displayStats[key]}</div>
                                <div className="ability-mod margin-bottom-sm">{formatModifier(modifiers[key])}</div>
                                {editing && <div className="margin-top-sm"><StatAdjuster statKey={key} /></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {character.languages && (
                    <div className="margin-bottom-lg">
                        <h2 className="step-title">Languages</h2>
                        <p className="languages-box">{character.languages}</p>
                    </div>
                )}

                {saveError && (
                    <div className="error-banner">
                        ⚠️ {saveError}
                    </div>
                )}

                <div className="action-footer">
                    {!editing ? (
                        <>
                            <button onClick={startEditing} className="btn btn-primary">
                                Edit Stats
                            </button>
                            <button onClick={fetchCharacter} className="btn btn-outline">
                                Refresh
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleSubmit} className="btn btn-success" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={cancelEditing} className="btn btn-outline" disabled={saving}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CharacterDisplay;
