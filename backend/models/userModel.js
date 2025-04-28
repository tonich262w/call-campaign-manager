const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definición del esquema de usuario
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true, // Guarda siempre en minúsculas
    trim: true, // Elimina espacios
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Rol no válido: {VALUE}'
    },
    default: 'user'
  },
  balance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  collection: 'users', // Especificar explícitamente el nombre de la colección
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Índices para mejorar el rendimiento en las búsquedas
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Middleware - antes de guardar el documento
userSchema.pre('save', function(next) {
  // Asegurar que el email siempre se guarde en minúsculas y sin espacios
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Middleware - antes de encontrar documentos
userSchema.pre('findOne', function() {
  // Si la consulta incluye un email, asegurarse de que esté en minúsculas
  if (this._conditions.email) {
    this._conditions.email = this._conditions.email.toLowerCase().trim();
  }
});

// Método para obtener información pública del usuario (sin datos sensibles)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    balance: this.balance,
    createdAt: this.createdAt,
    isActive: this.isActive
  };
};

// Método estático para buscar por email de forma segura
userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Método estático para actualizar el último login
userSchema.statics.updateLastLogin = async function(userId) {
  return this.findByIdAndUpdate(
    userId, 
    { lastLogin: new Date() }, 
    { new: true }
  );
};

// Crear y exportar el modelo
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;