import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService';
import './CreateCharacter.css';
function CreateCharacter() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    char_name: '',
    total_level: 1,
    total_hp: 1,
    initiative_bonus: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    languages: '',
    class_id: ''
  })

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await apiService.get('/classes');
        setClasses(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleClassSelection = (classId) => {
    setFormData({
      ...formData,
      class_id: classId
    });
  }

  const calculateModifier = (score) => Math.floor((score - 10) / 2);

  const handleStatChange = (stat, change) => {
    const currentVal = parseInt(formData[stat]) || 10;
    const newVal = Math.max(1, Math.min(30, currentVal + change));

    const newFormData = { ...formData, [stat]: newVal };

    // Auto-update derived stats
    if (stat === 'constitution') {
      const selectedClass = classes.find(c => c.id === formData.class_id);
      const hitDie = selectedClass ? selectedClass.hit_die : 10;
      newFormData.total_hp = hitDie + calculateModifier(newVal);
    }
    if (stat === 'dexterity') {
      newFormData.initiative_bonus = calculateModifier(newVal);
    }

    setFormData(newFormData);
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.char_name) {
      alert("Please enter a character name.");
      return;
    }
    if (step === 2 && !formData.class_id) {
      alert("Please select a class.");
      return;
    }
    if (step === 2 && formData.class_id) {
      // Initialize HP and Initiative when moving from Class -> Stats if not already set or easily derived
      const selectedClass = classes.find(c => c.id === formData.class_id);
      if (selectedClass) {
        const conMod = calculateModifier(formData.constitution);
        const dexMod = calculateModifier(formData.dexterity);
        setFormData(prev => ({
          ...prev,
          total_hp: selectedClass.hit_die + conMod,
          initiative_bonus: dexMod
        }));
      }
    }

    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    apiService.setAuthToken(user?.token);

    try {
      const payload = {
        ...formData,
        user_id: user?.id,
      };

      const response = await apiService.post('/characters/create', payload);

      if (response) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const renderStepIndicators = () => {
    const steps = ['Basics', 'Class', 'Stats', 'Review'];
    return (
      <div className="wizard-header">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          return (
            <div key={stepNumber} className={`wizard-step-indicator ${step === stepNumber ? 'active' : ''}`}>
              Step {stepNumber}: {label}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">Character Basics</h3>
            <div className="input-group">
              <label>Character Name *</label>
              <input className="input-field" type="text" name="char_name" placeholder="E.g. Aragorn" value={formData.char_name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Languages</label>
              <input className="input-field" type="text" name="languages" placeholder="Common, Elvish..." value={formData.languages} onChange={handleChange} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">Select a Class</h3>
            {loadingClasses ? (
              <p>Loading classes...</p>
            ) : (
              <div className="grid-select">
                {classes.map(c => (
                  <div
                    key={c.id}
                    className={`card selectable-card ${formData.class_id === c.id ? 'selected' : ''}`}
                    onClick={() => handleClassSelection(c.id)}
                  >
                    <h4 className="selectable-card-title">{c.class_name}</h4>
                    <p className="selectable-card-subtitle">{c.class_type}</p>
                    <div className="selectable-card-content">
                      <div className="margin-bottom-sm"><strong>Hit Die:</strong> d{c.hit_die}</div>
                      <div><strong>Primary:</strong> {c.primary_stat}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        return (
          <div className="step-content">
            <h3 className="step-title">Ability Scores</h3>
            <p className="selectable-card-subtitle margin-bottom-md">Adjust your ability scores.</p>
            <div className="grid-select stat-builder-grid">
              {stats.map(stat => (
                <div key={stat} className="card stat-builder-card">
                  <label className="stat-builder-label">{stat}</label>
                  <div className="stat-builder-controls">
                    <button type="button" className="btn-icon" onClick={() => handleStatChange(stat, -1)}>-</button>
                    <span className="stat-builder-value">{formData[stat]}</span>
                    <button type="button" className="btn-icon" onClick={() => handleStatChange(stat, 1)}>+</button>
                  </div>
                  <div className="stat-builder-mod">
                    Mod: {calculateModifier(formData[stat]) >= 0 ? '+' : ''}{calculateModifier(formData[stat])}
                  </div>
                </div>
              ))}
            </div>
            <div className="card derived-stats-box">
              <div><strong>Total HP:</strong> {formData.total_hp}</div>
              <div><strong>Initiative:</strong> {formData.initiative_bonus >= 0 ? '+' : ''}{formData.initiative_bonus}</div>
            </div>
          </div>
        );
      case 4:
        const selectedClass = classes.find(c => c.id === formData.class_id);
        return (
          <div className="step-content">
            <h3 className="step-title">Review your Character</h3>
            
            <div className="card margin-bottom-sm">
              <h4 className="review-section-title">Basics</h4>
              <p className="review-item"><strong>Name:</strong> {formData.char_name}</p>
              <p className="review-item"><strong>Languages:</strong> {formData.languages || 'None'}</p>
              <p className="review-item"><strong>Class:</strong> {selectedClass?.class_name} (Level 1)</p>
            </div>

            <div className="card">
              <h4 className="review-section-title">Stats</h4>
              <div className="review-stats-grid">
                <span className="review-stat-badge"><strong>STR:</strong> {formData.strength}</span>
                <span className="review-stat-badge"><strong>DEX:</strong> {formData.dexterity}</span>
                <span className="review-stat-badge"><strong>CON:</strong> {formData.constitution}</span>
                <span className="review-stat-badge"><strong>INT:</strong> {formData.intelligence}</span>
                <span className="review-stat-badge"><strong>WIS:</strong> {formData.wisdom}</span>
                <span className="review-stat-badge"><strong>CHA:</strong> {formData.charisma}</span>
              </div>
              <p className="review-item"><strong>Max HP:</strong> {formData.total_hp}</p>
              <p className="review-item"><strong>Initiative:</strong> {formData.initiative_bonus >= 0 ? '+' : ''}{formData.initiative_bonus}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container wizard-container">
      <div className="card">
        <h2 className="wizard-title">Create a New Character</h2>

        {renderStepIndicators()}

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="action-footer action-footer-right">
            {step > 1 && (
              <button type="button" className="btn btn-outline" style={{ marginRight: 'auto' }} onClick={handlePrevStep}>
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                Next
              </button>
            ) : (
              <button type="submit" className="btn btn-success">
                Submit Hero
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCharacter;