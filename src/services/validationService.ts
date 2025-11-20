// Data Validation Service
// Provides comprehensive data validation for all system entities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => ValidationResult;
}

export interface ClientValidation extends ValidationRule {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface UserValidation extends ValidationRule {
  username?: string;
  password?: string;
  role?: string;
}

export interface ProductValidation extends ValidationRule {
  name?: string;
  category?: string;
  quantity?: {
    min?: number;
    max?: number;
  };
  minQuantity?: {
    min?: number;
  };
  price?: string;
  unit?: string;
}

export interface AppointmentValidation extends ValidationRule {
  clientName?: string;
  service?: string;
  date?: {
    futureOnly?: boolean;
  };
  time?: string;
  duration?: string;
  status?: string[];
  price?: {
    min?: number;
  };
}

class ValidationService {
  // Common validation patterns
  private readonly PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/,
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    CURRENCY: /^R\$ \d+,\d{2}$/
  };

  private readonly VALIDATION_MESSAGES = {
    REQUIRED: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Formato de email inválido',
    INVALID_PHONE: 'Formato de telefone inválido',
    INVALID_DATE: 'Data inválida',
    INVALID_TIME: 'Horário inválido',
    INVALID_CURRENCY: 'Formato de moeda inválido',
    TOO_SHORT: 'Valor muito curto',
    TOO_LONG: 'Valor muito longo',
    INVALID_FORMAT: 'Formato inválido'
  };

  /**
   * Validate client data
   */
  validateClient(client: Partial<import('./database').Client>): ValidationResult {
    const errors: string[] = [];

    // Name validation
    if (!client.name || client.name.trim() === '') {
      errors.push('Nome é obrigatório');
    } else if (client.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    } else if (client.name.length > 100) {
      errors.push('Nome não pode ter mais de 100 caracteres');
    }

    // Email validation
    if (client.email) {
      if (!this.isValidEmail(client.email)) {
        errors.push(this.VALIDATION_MESSAGES.INVALID_EMAIL);
      }
    }

    // Phone validation
    if (client.phone) {
      if (!this.isValidPhone(client.phone)) {
        errors.push(this.VALIDATION_MESSAGES.INVALID_PHONE);
      }
    }

    // Address validation
    if (client.address && client.address.length > 200) {
      errors.push('Endereço não pode ter mais de 200 caracteres');
    }

    // Date of birth validation
    if (client.dateOfBirth) {
      if (!this.isValidDate(client.dateOfBirth)) {
        errors.push(this.VALIDATION_MESSAGES.INVALID_DATE);
      } else {
        const birthDate = new Date(client.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 150) {
          errors.push('Data de nascimento inválida');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user data
   */
  validateUser(user: Partial<import('./database').User>): ValidationResult {
    const errors: string[] = [];

    // Username validation
    if (!user.username || user.username.trim() === '') {
      errors.push('Nome de usuário é obrigatório');
    } else if (user.username.length < 3) {
      errors.push('Nome de usuário deve ter pelo menos 3 caracteres');
    } else if (user.username.length > 50) {
      errors.push('Nome de usuário não pode ter mais de 50 caracteres');
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(user.username)) {
      errors.push('Nome de usuário pode conter apenas letras, números, pontos, hífens e sublinhados');
    }

    // Password validation
    if (!user.password || user.password.trim() === '') {
      errors.push('Senha é obrigatória');
    } else if (user.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    } else if (user.password.length > 100) {
      errors.push('Senha não pode ter mais de 100 caracteres');
    }

    // Role validation
    if (user.role && !['admin', 'user'].includes(user.role)) {
      errors.push('Tipo de usuário inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate product data
   */
  validateProduct(product: Partial<import('./database').Product>): ValidationResult {
    const errors: string[] = [];

    // Name validation
    if (!product.name || product.name.trim() === '') {
      errors.push('Nome do produto é obrigatório');
    } else if (product.name.length > 100) {
      errors.push('Nome do produto não pode ter mais de 100 caracteres');
    }

    // Category validation
    if (!product.category || product.category.trim() === '') {
      errors.push('Categoria é obrigatória');
    } else if (product.category.length > 50) {
      errors.push('Categoria não pode ter mais de 50 caracteres');
    }

    // Quantity validation
    if (product.quantity === undefined || product.quantity === null) {
      errors.push('Quantidade é obrigatória');
    } else if (typeof product.quantity !== 'number' || product.quantity < 0) {
      errors.push('Quantidade deve ser um número positivo');
    }

    // Minimum quantity validation
    if (product.minQuantity === undefined || product.minQuantity === null) {
      errors.push('Quantidade mínima é obrigatória');
    } else if (typeof product.minQuantity !== 'number' || product.minQuantity < 0) {
      errors.push('Quantidade mínima deve ser um número positivo');
    } else if (product.quantity !== undefined && product.minQuantity > product.quantity) {
      errors.push('Quantidade mínima não pode ser maior que a quantidade atual');
    }

    // Price validation
    if (product.price) {
      if (!this.isValidCurrency(product.price)) {
        errors.push(this.VALIDATION_MESSAGES.INVALID_CURRENCY);
      }
    }

    // Unit validation
    if (product.unit && product.unit.length > 20) {
      errors.push('Unidade não pode ter mais de 20 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate appointment data
   */
  validateAppointment(appointment: Partial<import('./database').Appointment>): ValidationResult {
    const errors: string[] = [];

    // Client name validation
    if (!appointment.clientName || appointment.clientName.trim() === '') {
      errors.push('Nome do cliente é obrigatório');
    } else if (appointment.clientName.length > 100) {
      errors.push('Nome do cliente não pode ter mais de 100 caracteres');
    }

    // Service validation
    if (!appointment.service || appointment.service.trim() === '') {
      errors.push('Serviço é obrigatório');
    } else if (appointment.service.length > 100) {
      errors.push('Serviço não pode ter mais de 100 caracteres');
    }

    // Date validation
    if (!appointment.date || appointment.date.trim() === '') {
      errors.push('Data é obrigatória');
    } else if (!this.isValidDate(appointment.date)) {
      errors.push(this.VALIDATION_MESSAGES.INVALID_DATE);
    } else {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        errors.push('Data do agendamento não pode ser no passado');
      }
    }

    // Time validation
    if (appointment.time && !this.isValidTime(appointment.time)) {
      errors.push(this.VALIDATION_MESSAGES.INVALID_TIME);
    }

    // Duration validation
    if (appointment.duration && !/^\d+\s*min$/.test(appointment.duration)) {
      errors.push('Duração deve estar no formato "X min"');
    }

    // Status validation
    if (appointment.status && !['pendente', 'confirmado', 'cancelado', 'concluido'].includes(appointment.status)) {
      errors.push('Status inválido');
    }

    // Price validation
    if (appointment.price !== undefined && appointment.price !== null) {
      if (typeof appointment.price !== 'number' || appointment.price < 0) {
        errors.push('Preço deve ser um número positivo');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate transaction data
   */
  validateTransaction(transaction: Partial<import('./database').Transaction>): ValidationResult {
    const errors: string[] = [];

    // Description validation
    if (!transaction.description || transaction.description.trim() === '') {
      errors.push('Descrição é obrigatória');
    } else if (transaction.description.length > 200) {
      errors.push('Descrição não pode ter mais de 200 caracteres');
    }

    // Type validation
    if (!transaction.type || !['receita', 'despesa'].includes(transaction.type)) {
      errors.push('Tipo de transação inválido');
    }

    // Category validation
    if (!transaction.category || transaction.category.trim() === '') {
      errors.push('Categoria é obrigatória');
    } else if (transaction.category.length > 50) {
      errors.push('Categoria não pode ter mais de 50 caracteres');
    }

    // Amount validation
    if (transaction.amount === undefined || transaction.amount === null) {
      errors.push('Valor é obrigatório');
    } else if (typeof transaction.amount !== 'number') {
      errors.push('Valor deve ser um número');
    } else if (transaction.amount <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    // Date validation
    if (transaction.date) {
      if (!this.isValidDate(transaction.date)) {
        errors.push(this.VALIDATION_MESSAGES.INVALID_DATE);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper validation methods
  private isValidEmail(email: string): boolean {
    return this.PATTERNS.EMAIL.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return this.PATTERNS.PHONE.test(phone.replace(/\D/g, ''));
  }

  private isValidDate(date: string): boolean {
    if (!this.PATTERNS.DATE.test(date)) return false;
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  private isValidTime(time: string): boolean {
    return this.PATTERNS.TIME.test(time);
  }

  private isValidCurrency(currency: string): boolean {
    return this.PATTERNS.CURRENCY.test(currency);
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Format phone number
   */
  formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  /**
   * Parse currency string to number
   */
  parseCurrency(currencyString: string): number {
    return parseFloat(currencyString.replace('R$ ', '').replace(',', '.'));
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }

  formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;
