import { Campaign } from '../../services/apiService';

const NewCampaignPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    timezone: 'GMT-5',
    callHoursStart: '09:00',
    callHoursEnd: '18:00',
    callDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    maxAttempts: 3,
    callScript: '',
    targetAudience: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      callDays: {
        ...prevState.callDays,
        [name]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    if (!formData.endDate) newErrors.endDate = 'La fecha de finalización es obligatoria';
    if (formData.endDate < formData.startDate) newErrors.endDate = 'La fecha de finalización debe ser posterior a la fecha de inicio';
    
    const hasSelectedDay = Object.values(formData.callDays).some(day => day);
    if (!hasSelectedDay) newErrors.callDays = 'Debes seleccionar al menos un día';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Formatear los datos para el backend
      const campaignData = {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        timezone: formData.timezone,
        callHoursStart: formData.callHoursStart,
        callHoursEnd: formData.callHoursEnd,
        callDays: formData.callDays,
        maxAttempts: parseInt(formData.maxAttempts),
        callScript: formData.callScript,
        targetAudience: formData.targetAudience
      };
      
      // Llamar a la API para crear la campaña en Voximplant
      const response = await Campaign.create(campaignData);
      
      alert('¡Campaña creada exitosamente!');
      window.location.href = '/campaigns';
    } catch (error) {
      console.error('Error al crear la campaña:', error);
      setErrors({ form: 'Error al crear la campaña en Voximplant. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelForm = () => {
    window.location.href = '/campaigns';
  };

  return (
    <div className="campaign-form-container">
      <h2>Crear Nueva Campaña</h2>
      
      {errors.form && <div className="form-error">{errors.form}</div>}
      
      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="name">Nombre de la Campaña *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="startDate">Fecha de Inicio *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'input-error' : ''}
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>
            
            <div className="form-group half">
              <label htmlFor="endDate">Fecha de Finalización *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'input-error' : ''}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Configuración de Llamadas</h3>
          
          <div className="form-group">
            <label htmlFor="timezone">Zona Horaria</label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
            >
              <option value="GMT-8">GMT-8 (Pacífico)</option>
              <option value="GMT-7">GMT-7 (Montaña)</option>
              <option value="GMT-6">GMT-6 (Central)</option>
              <option value="GMT-5">GMT-5 (Este)</option>
              <option value="GMT-4">GMT-4 (Atlántico)</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="callHoursStart">Horario de Llamadas - Inicio</label>
              <input
                type="time"
                id="callHoursStart"
                name="callHoursStart"
                value={formData.callHoursStart}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="callHoursEnd">Horario de Llamadas - Fin</label>
              <input
                type="time"
                id="callHoursEnd"
                name="callHoursEnd"
                value={formData.callHoursEnd}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Días para Llamadas</label>
            <div className="checkbox-group">
              {errors.callDays && <span className="error-message">{errors.callDays}</span>}
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="monday" 
                  checked={formData.callDays.monday} 
                  onChange={handleCheckboxChange} 
                />
                Lunes
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="tuesday" 
                  checked={formData.callDays.tuesday} 
                  onChange={handleCheckboxChange} 
                />
                Martes
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="wednesday" 
                  checked={formData.callDays.wednesday} 
                  onChange={handleCheckboxChange} 
                />
                Miércoles
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="thursday" 
                  checked={formData.callDays.thursday} 
                  onChange={handleCheckboxChange} 
                />
                Jueves
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="friday" 
                  checked={formData.callDays.friday} 
                  onChange={handleCheckboxChange} 
                />
                Viernes
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="saturday" 
                  checked={formData.callDays.saturday} 
                  onChange={handleCheckboxChange} 
                />
                Sábado
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="sunday" 
                  checked={formData.callDays.sunday} 
                  onChange={handleCheckboxChange} 
                />
                Domingo
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="maxAttempts">Número Máximo de Intentos</label>
            <input
              type="number"
              id="maxAttempts"
              name="maxAttempts"
              min="1"
              max="10"
              value={formData.maxAttempts}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contenido de la Campaña</h3>
          
          <div className="form-group">
            <label htmlFor="callScript">Guion de Llamada</label>
            <textarea
              id="callScript"
              name="callScript"
              rows="5"
              value={formData.callScript}
              onChange={handleChange}
              placeholder="Ej: Hola, mi nombre es [Nombre del Agente]. Estoy llamando de parte de [Empresa]..."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="targetAudience">Público Objetivo</label>
            <textarea
              id="targetAudience"
              name="targetAudience"
              rows="3"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="Describe brevemente el perfil de las personas a las que va dirigida esta campaña"
            ></textarea>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="button secondary" 
            onClick={cancelForm}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className="button primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </div>
  );
};

