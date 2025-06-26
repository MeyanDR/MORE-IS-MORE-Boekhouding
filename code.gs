// Code.gs - VZW Accounting System - VOLLEDIG GEFIXTE VERSIE 4.0
// Alle bugs opgelost inclusief klanten zoeken, PDF export, file upload en styling
// ==================== CONFIGURATIE ====================
const CONFIG = {
  production: {
    airtableToken: 'patGyvyT913BTnau0.c7200073a6a99aaeb420fd5a8beaecc85494adecbcc18cfed98f54cdee86f743',
    airtableBase: 'appPwcdZUr8yfiGvP',
    debugMode: false,
    rateLimitDelay: 200
  }
};

const DRIVE_FOLDERS = {
  INVOICES: '1JotWJZtejm6r5FGF4qzC29JYq3XJm7VT',
  REPORTS: '1aPVb4sWg-D5fE0pg3hSI4xlx3Sfqrpp5',
  EXPENSES: '1T0dz62ya_-IQc96Uk0eVQfNtVm0Jgqll'
};

const COMPANY_INFO = {
  name: 'MORE IS MORE! Agency',
  address: 'Abdissenstraat 11',
  postalCode: '1190',
  city: 'Vorst',
  country: 'België',
  phone: '+32 497 16.24.90 / +32 475 84.72.32',
  email: 'moreismoreagency2024@gmail.com',
  vatNumber: 'BE 1017.971.844',
  iban: 'BE12 5230 8164 6692',
  bic: 'TRIONL2U'
};

// ==================== COMPLETE CULTURE SECTOR NACE CODES ====================
const CULTURE_NACE_CODES = [
  { code: '90.01', description: 'Podiumkunsten' },
  { code: '90.02', description: 'Ondersteunende podiumkunsten' },
  { code: '90.03', description: 'Artistieke creatie' },
  { code: '90.04', description: 'Exploitatie van kunst- en cultuurcentra' },
  { code: '59.20', description: 'Maken en uitgeven van geluidsopnamen' },
  { code: '60.10', description: 'Radio-uitzendingen' },
  { code: '60.20', description: 'Televisie-uitzendingen' },
  { code: '82.30', description: 'Evenementorganisatie' },
  { code: '93.29', description: 'Overige recreatieve activiteiten' },
  { code: '93.21', description: 'Kermisattracties en pretparken' },
  { code: '85.52', description: 'Cultureel onderwijs' },
  { code: '85.59', description: 'Overige vormen van onderwijs' },
  { code: '58.11', description: 'Uitgeverij van boeken' },
  { code: '58.13', description: 'Uitgeverij van kranten' },
  { code: '58.14', description: 'Uitgeverij van tijdschriften' },
  { code: '58.29', description: 'Uitgeverij van overige software' },
  { code: '59.11', description: 'Productie van films' },
  { code: '59.12', description: 'Postproductie van films' },
  { code: '59.13', description: 'Distributie van films' },
  { code: '59.14', description: 'Vertoning van films' },
  { code: '71.11', description: 'Architectenactiviteiten' },
  { code: '74.10', description: 'Ontwerpen en vormgeving' },
  { code: '74.20', description: 'Fotografische activiteiten' },
  { code: '73.11', description: 'Reclamebureaus' },
  { code: '91.02', description: 'Museumactiviteiten' },
  { code: '91.03', description: 'Beheer van monumenten en historische gebouwen' },
  { code: '32.12', description: 'Vervaardiging van juwelen' },
  { code: '32.20', description: 'Vervaardiging van muziekinstrumenten' },
  { code: '62.01', description: 'Ontwikkelen van computerprogramma\'s' },
  { code: '63.12', description: 'Webportals' }
];

// ==================== MAIN ENTRY POINT ====================
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('VZW Accounting System - MORE IS MORE Agency')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== ENHANCED ERROR HANDLER ====================
class ErrorHandler {
  static handle(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      context: context,
      user: Session.getActiveUser().getEmail()
    };
    
    console.error('System Error:', errorInfo);
    
    return {
      success: false,
      error: this.getUserFriendlyMessage(error),
      technicalDetails: CONFIG.production.debugMode ? error.message : 'Contact support if this persists'
    };
  }
  
  static getUserFriendlyMessage(error) {
    const friendlyMessages = {
      'RATE_LIMIT_EXCEEDED': 'System is busy. Please try again in a moment.',
      'INVALID_DATA': 'Please check your input and try again.',
      'PERMISSION_DENIED': 'You do not have permission for this action.',
      'NETWORK_ERROR': 'Connection issue. Please try again.',
      'VALIDATION_ERROR': 'Please check your data and try again.',
      'INVALID_MULTIPLE_CHOICE_OPTIONS': 'Some options need to be created in Airtable first.'
    };
    
    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (error.message.includes(key)) {
        return message;
      }
    }
    
    return 'An unexpected error occurred. Please try again or contact support.';
  }
}

// ==================== ENHANCED AIRTABLE SERVICE ====================
class AirtableService {
  constructor() {
    this.baseUrl = 'https://api.airtable.com/v0/';
    this.token = CONFIG.production.airtableToken;
    this.baseId = CONFIG.production.airtableBase;
    this.maxRetries = 3;
    this.baseDelay = 500; // Verhoogd van 200ms naar 500ms
  }
  
  // CRITICAL FIX: Verbeterde retry logic met exponential backoff
  makeRequestWithRetry(url, options, retryCount = 0) {
    try {
      // Progressieve delay - steeds langer wachten
      const delay = this.baseDelay * Math.pow(2, retryCount);
      Utilities.sleep(delay);
      
      console.log(`Making request attempt ${retryCount + 1} to ${url}`);
      
      const response = UrlFetchApp.fetch(url, {
        ...options,
        muteHttpExceptions: true,
        timeout: 30000 // 30 seconden timeout
      });
      
      const responseCode = response.getResponseCode();
      console.log(`Response code: ${responseCode}`);
      
      // Success cases
      if (responseCode === 200) {
        return {
          success: true,
          response: response
        };
      }
      
      // Rate limit cases - retry with longer delay
      if (responseCode === 429 || responseCode === 502 || responseCode === 503) {
        if (retryCount < this.maxRetries) {
          console.log(`Rate limited or server error (${responseCode}), retrying in ${delay * 2}ms...`);
          Utilities.sleep(delay * 2); // Extra lange pause voor rate limiting
          return this.makeRequestWithRetry(url, options, retryCount + 1);
        }
      }
      
      // Other errors
      const errorText = response.getContentText();
      throw new Error(`HTTP ${responseCode}: ${errorText}`);
      
    } catch (error) {
      if (retryCount < this.maxRetries && (
        error.message.includes('timeout') || 
        error.message.includes('502') ||
        error.message.includes('503') ||
        error.message.includes('rate limit')
      )) {
        console.log(`Request failed (${error.message}), retrying...`);
        const delay = this.baseDelay * Math.pow(2, retryCount + 1);
        Utilities.sleep(delay);
        return this.makeRequestWithRetry(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  createRecord(tableName, fields, options = {}) {
    try {
      console.log(`Creating record in ${tableName}:`, fields);
      
      if (!fields || Object.keys(fields).length === 0) {
        throw new Error('VALIDATION_ERROR: No data provided');
      }
      
      const payload = {
        records: [{
          fields: this.sanitizeFields(fields)
        }],
        typecast: options.typecast !== false
      };
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload)
      };
      
      const result = this.makeRequestWithRetry(
        `${this.baseUrl}${this.baseId}/${tableName}`, 
        requestOptions
      );
      
      if (result.success) {
        const data = JSON.parse(result.response.getContentText());
        return {
          success: true,
          record: data.records[0],
          message: 'Record successfully created'
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.createRecord error:', error);
      return ErrorHandler.handle(error, { table: tableName, fields });
    }
  }
  
  getRecords(tableName, options = {}) {
    try {
      console.log(`Getting records from ${tableName}:`, options);
      
      let url = `${this.baseUrl}${this.baseId}/${tableName}`;
      
      const params = [];
      if (options.filterByFormula) params.push(`filterByFormula=${encodeURIComponent(options.filterByFormula)}`);
      if (options.sort) params.push(`sort[0][field]=${options.sort.field}&sort[0][direction]=${options.sort.direction}`);
      if (options.maxRecords) params.push(`maxRecords=${options.maxRecords}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const result = this.makeRequestWithRetry(url, requestOptions);
      
      if (result.success) {
        const data = JSON.parse(result.response.getContentText());
        return {
          success: true,
          records: data.records || [],
          count: data.records ? data.records.length : 0
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.getRecords error:', error);
      return ErrorHandler.handle(error, { table: tableName, options });
    }
  }
  
  updateRecord(tableName, recordId, fields) {
    try {
      console.log(`Updating record ${recordId} in ${tableName}:`, fields);
      
      const payload = {
        records: [{
          id: recordId,
          fields: this.sanitizeFields(fields)
        }],
        typecast: true
      };
      
      const requestOptions = {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload)
      };
      
      const result = this.makeRequestWithRetry(
        `${this.baseUrl}${this.baseId}/${tableName}`, 
        requestOptions
      );
      
      if (result.success) {
        const data = JSON.parse(result.response.getContentText());
        return {
          success: true,
          record: data.records[0],
          message: 'Record successfully updated'
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.updateRecord error:', error);
      return ErrorHandler.handle(error, { table: tableName, recordId, fields });
    }
  }
  
  deleteRecord(tableName, recordId) {
    try {
      console.log(`Deleting record ${recordId} from ${tableName}`);
      
      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };
      
      const result = this.makeRequestWithRetry(
        `${this.baseUrl}${this.baseId}/${tableName}/${recordId}`, 
        requestOptions
      );
      
      if (result.success) {
        return {
          success: true,
          message: 'Record successfully deleted'
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.deleteRecord error:', error);
      return ErrorHandler.handle(error, { table: tableName, recordId });
    }
  }
  
  sanitizeFields(fields) {
    const sanitized = {};
    Object.keys(fields).forEach(key => {
      let value = fields[key];
      
      if (typeof value === 'string') {
        value = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
        value = value.trim();
      }
      
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }
}

// ==================== BUG FIX 1: CLIENT AUTOCOMPLETE SEARCH (GEFIXED) ====================
function searchClients(query) {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        clients: []
      };
    }
    
    const airtable = new AirtableService();
    
    // FIXED: Correcte filterByFormula syntax voor Airtable met null-checks
    const searchTerm = query.toLowerCase().replace(/'/g, "\\'");
    const searchFormula = `OR(
      FIND("${searchTerm}", LOWER(CONCATENATE({Klantgegevens},""))),
      FIND("${searchTerm}", LOWER(CONCATENATE({Contactpersoon},""))),
      FIND("${searchTerm}", LOWER(CONCATENATE({Email},""))),
      FIND("${searchTerm}", LOWER(CONCATENATE({Stad},"")))
    )`;
    
    const result = airtable.getRecords('Klanten', {
      filterByFormula: searchFormula,
      maxRecords: 10
    });
    
    if (!result.success) {
      return result;
    }
    
    // Transform voor frontend
    const clients = result.records.map(record => ({
      id: record.id,
      company: record.fields.Klantgegevens || '',
      contact: record.fields.Contactpersoon || '',
      address: record.fields.Adres || '',
      postalCode: record.fields.Postcode || '',
      city: record.fields.Stad || '',
      country: record.fields.Land || 'België',
      vatNumber: record.fields['BTW-nummer'] || '',
      email: record.fields.Email || '',
      phone: record.fields.Telefoon || ''
    }));
    
    return {
      success: true,
      clients: clients
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'searchClients', query });
  }
}

// ==================== ENHANCED VALIDATION SERVICE ====================
class ValidationService {
  static validateTransaction(data) {
    const errors = [];
    
    if (!data.Beschrijving) errors.push('Description is required');
    if (!data.Bedrag || parseFloat(data.Bedrag) <= 0) errors.push('Valid amount is required');
    if (!data.Date) errors.push('Date is required');
    if (!data.Select) errors.push('Transaction type is required');
    
    if (data.Bedrag && !this.isValidAmount(data.Bedrag)) {
      errors.push('Amount must be a valid number with maximum 2 decimals');
    }
    
    if (data.Date && !this.isValidDate(data.Date)) {
      errors.push('Date must be in valid format');
    }
    
    if (data['BTW Percentage'] && !this.isValidVATRate(data['BTW Percentage'])) {
      errors.push('VAT rate must be 0, 6, 12, or 21');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static validateProject(data) {
    const errors = [];
    
    if (!data.Naam) errors.push('Project name is required');
    if (!data.Type) errors.push('Project type is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static validateClient(data) {
    const errors = [];
    
    if (!data.Klantgegevens) errors.push('Client name is required');
    if (!data.Contactpersoon) errors.push('Contact person is required');
    
    if (data.Email && !this.isValidEmail(data.Email)) {
      errors.push('Valid email address is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static isValidAmount(amount) {
    const pattern = /^\d{1,10}(\.\d{1,2})?$/;
    return pattern.test(amount.toString()) && parseFloat(amount) > 0;
  }
  
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
  
  static isValidVATRate(rate) {
    const validRates = [0, 6, 12, 21];
    return validRates.includes(parseFloat(rate));
  }
  
  static isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
}

// ==================== TAX CALCULATOR ====================
class TaxCalculator {
  static calculateBelgianVAT(amount, vatRate) {
    const rate = parseFloat(vatRate) / 100;
    const vatAmount = amount * rate;
    const total = amount + vatAmount;
    
    return {
      netAmount: parseFloat(amount.toFixed(2)),
      vatRate: rate,
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalAmount: parseFloat(total.toFixed(2))
    };
  }
  
  static getBelgianVATRates() {
    return {
      'standard': 21,
      'reduced': 6,
      'intermediate': 12,
      'zero': 0
    };
  }
}

// ==================== DASHBOARD FUNCTIONS ====================
function loadDashboardData() {
  try {
    const airtable = new AirtableService();
    
    const transactionsResult = airtable.getRecords('Transacties');
    
    if (!transactionsResult.success) {
      return transactionsResult;
    }
    
    const transactions = transactionsResult.records;
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalVAT = 0;
    
    const recentTransactions = [];
    const invoices = [];
    const expenses = [];
    
    transactions.forEach(record => {
      const fields = record.fields;
      const amount = parseFloat(fields.Bedrag || 0);
      const vatAmount = parseFloat(fields['BTW Bedrag'] || 0);
      
      if (fields.Select === 'Inkomsten') {
        totalIncome += amount;
        if (fields.Name && (fields.Name.includes('-') || fields.Name.startsWith('2025'))) {
          invoices.push(record);
        }
      } else if (fields.Select === 'Uitgaven') {
        totalExpenses += amount;
        expenses.push(record);
      }
      
      totalVAT += vatAmount;
      recentTransactions.push(record);
    });
    
    recentTransactions.sort((a, b) => {
      const dateA = new Date(a.fields.Date || 0);
      const dateB = new Date(b.fields.Date || 0);
      return dateB - dateA;
    });
    
    return {
      success: true,
      data: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netResult: totalIncome - totalExpenses,
        totalVAT: totalVAT,
        transactions: recentTransactions.slice(0, 10),
        invoices: invoices,
        expenses: expenses,
        transactionCount: transactions.length
      }
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'loadDashboardData' });
  }
}

// ==================== TRANSACTION FUNCTIONS ====================
function createTransaction(transactionData) {
  try {
    const validation = ValidationService.validateTransaction(transactionData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }
    
    const amount = parseFloat(transactionData.Bedrag);
    const vatRate = parseFloat(transactionData['BTW Percentage'] || 0);
    const vatCalculation = TaxCalculator.calculateBelgianVAT(amount, vatRate);
    
    const record = {
      Name: generateTransactionReference(transactionData.Select),
      Date: transactionData.Date,
      Select: transactionData.Select,
      Project: transactionData.Project || 'Algemeen',
      Beschrijving: transactionData.Beschrijving,
      'NACE Code': transactionData['NACE Code'] || '',
      Bedrag: vatCalculation.netAmount,
      'BTW Percentage': vatRate,
      'BTW Bedrag': vatCalculation.vatAmount,
      Totaal: vatCalculation.totalAmount,
      Status: transactionData.Select === 'Inkomsten' ? 'Betaald (betaalde facturen/uitgaven)' : 'Betaald (betaalde facturen/uitgaven)'
    };
    
    if (transactionData.Select === 'Uitgaven') {
      if (transactionData.Leverancier) record.Leverancier = transactionData.Leverancier;
      if (transactionData.Categorie) record.Categorie = transactionData.Categorie;
      if (transactionData.Betaalmethode) record.Betaalmethode = transactionData.Betaalmethode;
    }
    
    const airtable = new AirtableService();
    return airtable.createRecord('Transacties', record, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createTransaction' });
  }
}

function generateTransactionReference(type) {
  const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-').replace('T', '_');
  const prefix = type === 'Inkomsten' ? 'INC' : 'EXP';
  return `${prefix}_${timestamp}`;
}

function getAllTransactions() {
  const airtable = new AirtableService();
  return airtable.getRecords('Transacties', {
    sort: { field: 'Date', direction: 'desc' }
  });
}

function deleteTransaction(recordId) {
  const airtable = new AirtableService();
  return airtable.deleteRecord('Transacties', recordId);
}

// ==================== PROJECT FUNCTIONS ====================
function createProject(projectData) {
  try {
    const validation = ValidationService.validateProject(projectData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }
    
    const record = {
      Naam: projectData.Naam,
      Type: projectData.Type,
      Beschrijving: projectData.Beschrijving || '',
      Aangemaakt: new Date().toISOString().split('T')[0]
    };
    
    const airtable = new AirtableService();
    return airtable.createRecord('Projecten', record, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createProject' });
  }
}

function getAllProjects() {
  const airtable = new AirtableService();
  return airtable.getRecords('Projecten', {
    sort: { field: 'Aangemaakt', direction: 'desc' }
  });
}

function deleteProject(recordId) {
  const airtable = new AirtableService();
  return airtable.deleteRecord('Projecten', recordId);
}

// ==================== CLIENT FUNCTIONS ====================
function createClient(clientData) {
  try {
    const validation = ValidationService.validateClient(clientData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }
    
    const airtable = new AirtableService();
    return airtable.createRecord('Klanten', clientData, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createClient' });
  }
}

function getAllClients() {
  const airtable = new AirtableService();
  return airtable.getRecords('Klanten');
}

function getCultureNACECodes() {
  return {
    success: true,
    codes: CULTURE_NACE_CODES
  };
}

// ==================== BUG FIX 2: INVOICE PDF GENERATION (GEFIXED) ====================
function generateInvoiceNumber() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const year = new Date().getFullYear();
    const key = `invoiceNumber_${year}`;
    
    let lastNumber = parseInt(properties.getProperty(key) || '0');
    const newNumber = lastNumber + 1;
    
    properties.setProperty(key, newNumber.toString());
    
    return `${year}-${String(newNumber).padStart(3, '0')}`;
    
  } catch (error) {
    return `${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
  }
}

function createInvoice(invoiceData) {
  try {
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = generateInvoiceNumber();
    }
    
    let subtotal = 0;
    let totalVAT = 0;
    
    invoiceData.services.forEach(service => {
      const lineTotal = service.quantity * service.unitPrice;
      subtotal += lineTotal;
      
      if (service.vat !== 'Vrijgesteld' && service.vat !== '0') {
        const vatRate = parseFloat(service.vat.toString().replace('%', '')) / 100;
        totalVAT += lineTotal * vatRate;
      }
    });
    
    const total = subtotal + totalVAT + (invoiceData.discount || 0);
    
    const transactionRecord = {
      Name: invoiceData.invoiceNumber,
      Date: invoiceData.invoiceDate.split('/').reverse().join('-'),
      Select: 'Inkomsten',
      Project: invoiceData.projectName || 'Algemeen',
      Beschrijving: `Factuur ${invoiceData.invoiceNumber} - ${invoiceData.clientCompany}`,
      Bedrag: subtotal,
      'BTW Bedrag': totalVAT,
      Totaal: total,
      Status: 'Verzonden (verzonden facturen)'
    };
    
    const airtable = new AirtableService();
    const transactionResult = airtable.createRecord('Transacties', transactionRecord, { typecast: true });
    
    if (!transactionResult.success) {
      return transactionResult;
    }
    
    const pdfResult = generateInvoicePDF(invoiceData);
    
    return {
      success: true,
      message: 'Invoice created successfully',
      invoiceNumber: invoiceData.invoiceNumber,
      pdfResult: pdfResult
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createInvoice' });
  }
}

/**
 * VERBETERDE PDF GENERATIE - FIX VOOR TIMEOUTS EN DRIVE ISSUES
 */
function generateInvoicePDF(invoiceData) {
  let tempDoc = null;
  
  try {
    console.log('=== STARTING PDF GENERATION ===');
    console.log('Invoice number:', invoiceData.invoiceNumber);
    
    // STEP 1: Validate inputs
    if (!invoiceData || !invoiceData.invoiceNumber) {
      throw new Error('Invalid invoice data provided');
    }
    
    // STEP 2: Test Drive folder access FIRST
    let targetFolder;
    try {
      targetFolder = DriveApp.getFolderById(DRIVE_FOLDERS.INVOICES);
      console.log('✅ Drive folder access verified:', targetFolder.getName());
    } catch (folderError) {
      console.error('❌ Drive folder access failed:', folderError);
      
      // Try to create folder if it doesn't exist
      try {
        const folders = DriveApp.getFoldersByName('Facturen');
        if (folders.hasNext()) {
          targetFolder = folders.next();
          console.log('✅ Using existing Facturen folder');
        } else {
          targetFolder = DriveApp.createFolder('Facturen');
          console.log('✅ Created new Facturen folder');
        }
      } catch (createError) {
        throw new Error('Cannot access or create invoice folder: ' + createError.message);
      }
    }
    
    // STEP 3: Calculate totals (simplified)
    let subtotal = 0;
    let totalVAT = 0;
    const processedServices = [];
    
    invoiceData.services.forEach(service => {
      const lineAmount = service.quantity * service.unitPrice;
      let lineVAT = 0;
      
      if (service.vat !== '0' && service.vat !== 'Vrijgesteld') {
        const vatRate = parseFloat(service.vat.toString().replace('%', '')) / 100;
        lineVAT = lineAmount * vatRate;
      }
      
      processedServices.push({
        description: service.description,
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        vat: service.vat === '0' || service.vat === 'Vrijgesteld' ? 'Vrijgesteld' : service.vat + '%',
        total: lineAmount + lineVAT
      });
      
      subtotal += lineAmount;
      totalVAT += lineVAT;
    });
    
    const grandTotal = subtotal + totalVAT + (invoiceData.discount || 0);
    
    // STEP 4: Create document with simplified approach
    const timestamp = Date.now();
    const tempDocName = `Invoice_${invoiceData.invoiceNumber}_${timestamp}`;
    
    console.log('Creating document:', tempDocName);
    tempDoc = DocumentApp.create(tempDocName);
    
    if (!tempDoc) {
      throw new Error('Failed to create Google Document');
    }
    
    const body = tempDoc.getBody();
    body.clear();
    
    // STEP 5: Build document content (simplified for speed)
    
    // Header
    const header = body.appendParagraph('MORE IS MORE! AGENCY');
    header.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    const invoiceTitle = body.appendParagraph('FACTUUR');
    invoiceTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    invoiceTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    // Company info
    body.appendParagraph(
      `${COMPANY_INFO.address}\n` +
      `${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}, ${COMPANY_INFO.country}\n` +
      `Tel: ${COMPANY_INFO.phone}\n` +
      `Email: ${COMPANY_INFO.email}\n` +
      `BTW: ${COMPANY_INFO.vatNumber}`
    );
    
    // Invoice details
    const details = body.appendParagraph(
      `Factuurnummer: ${invoiceData.invoiceNumber}\n` +
      `Datum: ${invoiceData.invoiceDate}\n` +
      `Project: ${invoiceData.projectName}`
    );
    details.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    
    // Client address
    body.appendParagraph('FACTUURADRES').setFontWeight(true);
    body.appendParagraph(
      `${invoiceData.clientCompany}\n` +
      `${invoiceData.contactPerson}\n` +
      `${invoiceData.address}\n` +
      `${invoiceData.postalCode || ''} ${invoiceData.city}\n` +
      `BTW: ${invoiceData.vatNumber || 'n.v.t.'}`
    );
    
    // Services (simplified table)
    body.appendParagraph('DIENSTEN').setFontWeight(true);
    
    processedServices.forEach((service, index) => {
      body.appendParagraph(
        `${index + 1}. ${service.description} - ${service.quantity}x €${service.unitPrice.toFixed(2)} (BTW: ${service.vat}) = €${service.total.toFixed(2)}`
      );
    });
    
    // Totals
    body.appendParagraph('\n');
    const totalsText = body.appendParagraph(
      `Subtotaal: €${subtotal.toFixed(2)}\n` +
      `BTW: €${totalVAT.toFixed(2)}\n` +
      `TOTAAL: €${grandTotal.toFixed(2)}`
    );
    totalsText.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    totalsText.setFontWeight(true);
    
    // Payment info
    body.appendParagraph('\nBETALINGSGEGEVENS').setFontWeight(true);
    body.appendParagraph(
      `IBAN: ${COMPANY_INFO.iban}\n` +
      `BIC: ${COMPANY_INFO.bic}\n` +
      `Mededeling: ${invoiceData.invoiceNumber}`
    );
    
    console.log('✅ Document content created');
    
    // STEP 6: Save document and wait
    tempDoc.saveAndClose();
    console.log('✅ Document saved and closed');
    
    // CRITICAL: Wait longer for document to be ready
    Utilities.sleep(5000);
    
    // STEP 7: Convert to PDF with error handling
    let pdfBlob;
    try {
      pdfBlob = tempDoc.getAs('application/pdf');
      console.log('✅ PDF blob created, size:', pdfBlob.getBytes().length);
    } catch (pdfError) {
      console.error('❌ PDF conversion failed:', pdfError);
      throw new Error('PDF conversion failed: ' + pdfError.message);
    }
    
    // STEP 8: Save to Drive with systematic naming
    const fileName = `Factuur_${invoiceData.invoiceNumber}.pdf`;
    
    try {
      const file = targetFolder.createFile(pdfBlob);
      file.setName(fileName);
      
      // Set sharing permissions
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      console.log('✅ PDF saved successfully:', fileName);
      
      // Clean up temporary document
      try {
        DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
        console.log('✅ Temporary document cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp document:', cleanupError);
      }
      
      return {
        success: true,
        fileId: file.getId(),
        fileName: fileName,
        downloadUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
        directDownloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
        folderId: targetFolder.getId(),
        folderName: targetFolder.getName()
      };
      
    } catch (saveError) {
      console.error('❌ Failed to save PDF to Drive:', saveError);
      throw new Error('Failed to save PDF to Drive: ' + saveError.message);
    }
    
  } catch (error) {
    console.error('=== PDF GENERATION FAILED ===');
    console.error('Error details:', error);
    
    // Clean up on error
    if (tempDoc) {
      try {
        DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
        console.log('✅ Cleaned up temp document after error');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp document after error');
      }
    }
    
    return {
      success: false,
      error: error.message || 'Unknown PDF generation error',
      details: error.toString()
    };
  }
}

/**
 * SIMPLIFIED PROJECT CREATION - FIX FOR 502 ERRORS
 */
function createProject(projectData) {
  try {
    console.log('=== CREATING PROJECT ===');
    console.log('Project data:', projectData);
    
    // Enhanced validation
    if (!projectData || !projectData.Naam || !projectData.Type) {
      throw new Error('VALIDATION_ERROR: Project name and type are required');
    }
    
    // Sanitize data
    const record = {
      Naam: String(projectData.Naam).trim(),
      Type: String(projectData.Type).trim(),
      Beschrijving: projectData.Beschrijving ? String(projectData.Beschrijving).trim() : '',
      Aangemaakt: new Date().toISOString().split('T')[0]
    };
    
    console.log('Sanitized record:', record);
    
    // Use improved Airtable service
    const airtable = new AirtableService();
    const result = airtable.createRecord('Projecten', record, { typecast: true });
    
    console.log('Project creation result:', result);
    return result;
    
  } catch (error) {
    console.error('Project creation error:', error);
    return ErrorHandler.handle(error, { function: 'createProject', projectData });
  }
}

// Helper functions for date handling
function parseDate(dateString) {
  const parts = dateString.split('/');
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ==================== BUG FIX 3: FILE UPLOAD FOR EXPENSES (GEFIXED) ====================
function generateExpenseNumber() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const year = new Date().getFullYear();
    const key = `expenseNumber_${year}`;
    
    let lastNumber = parseInt(properties.getProperty(key) || '0');
    const newNumber = lastNumber + 1;
    
    properties.setProperty(key, newNumber.toString());
    
    return `UIT-${year}-${String(newNumber).padStart(4, '0')}`;
    
  } catch (error) {
    return `UIT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  }
}

function createExpense(expenseData) {
  try {
    if (!expenseData.expenseNumber) {
      expenseData.expenseNumber = generateExpenseNumber();
    }
    
    const amount = parseFloat(expenseData.amount);
    const vatRate = parseFloat(expenseData.vatPercentage || 0);
    const vatCalculation = TaxCalculator.calculateBelgianVAT(amount, vatRate);
    
    const record = {
      Name: expenseData.expenseNumber,
      Date: expenseData.date,
      Select: 'Uitgaven',
      Project: expenseData.project || 'Algemeen',
      Beschrijving: expenseData.description,
      Leverancier: expenseData.vendor,
      Categorie: expenseData.category,
      Betaalmethode: expenseData.paymentMethod || 'Bankoverschrijving',
      Bedrag: vatCalculation.netAmount,
      'BTW Percentage': vatRate,
      'BTW Bedrag': vatCalculation.vatAmount,
      Totaal: vatCalculation.totalAmount,
      Status: 'Betaald (betaalde facturen/uitgaven)'
    };
    
    const airtable = new AirtableService();
    return airtable.createRecord('Transacties', record, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createExpense' });
  }
}

function createExpenseWithFile(expenseData, fileBlob, fileName) {
  try {
    // First create the expense record
    const expenseResult = createExpense(expenseData);
    
    if (!expenseResult.success) {
      return expenseResult;
    }
    
    // Upload file to organized folder structure
    const fileResult = uploadExpenseFile(fileBlob, fileName, expenseData);
    
    // FIXED: Update the expense record with NEW field names
    if (fileResult.success) {
      const airtable = new AirtableService();
      const updateResult = airtable.updateRecord('Transacties', expenseResult.record.id, {
        'Bijlage URL': fileResult.fileUrl,
        'Bijlage Bestandsnaam': fileResult.fileName
      });
      
      return {
        success: true,
        expenseRecord: expenseResult,
        fileResult: fileResult,
        updateResult: updateResult,
        message: 'Expense with file created successfully'
      };
    } else {
      return fileResult;
    }
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createExpenseWithFile' });
  }
}

function uploadExpenseFile(fileBlob, fileName, expenseData) {
  try {
    // Create systematic filename
    const timestamp = new Date().getTime();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const category = expenseData.category || 'General';
    const systematicFileName = `EXP_${expenseData.expenseNumber}_${category}_${timestamp}_${sanitizedName}`;
    
    // Get or create folder structure
    const baseFolder = getOrCreateExpenseFolder();
    const categoryFolder = getOrCreateCategoryFolder(baseFolder, category);
    const monthFolder = getOrCreateMonthFolder(categoryFolder);
    
    // Create file blob and upload
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileBlob.data),
      fileBlob.mimeType,
      systematicFileName
    );
    
    const uploadedFile = monthFolder.createFile(blob);
    uploadedFile.setDescription(`Expense file uploaded on ${new Date().toISOString()} for expense ${expenseData.expenseNumber}`);
    
    // Set proper permissions
    uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      fileId: uploadedFile.getId(),
      fileName: systematicFileName,
      fileUrl: uploadedFile.getUrl(),
      viewUrl: `https://drive.google.com/file/d/${uploadedFile.getId()}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${uploadedFile.getId()}`
    };
    
  } catch (error) {
    console.error('File upload error:', error);
    return ErrorHandler.handle(error, { function: 'uploadExpenseFile' });
  }
}

function getOrCreateExpenseFolder() {
  const folderName = 'Expense Files';
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function getOrCreateCategoryFolder(parentFolder, category) {
  const folders = parentFolder.getFoldersByName(category);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(category);
}

function getOrCreateMonthFolder(parentFolder) {
  const now = new Date();
  const folderName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

// ==================== BUG FIX 4: REPORT PDF GENERATION (GEFIXED) ====================
function generateReport(config) {
  try {
    const airtable = new AirtableService();
    const transactionsResult = airtable.getRecords('Transacties');
    
    if (!transactionsResult.success) {
      return transactionsResult;
    }
    
    let transactions = transactionsResult.records;
    
    // Apply filters
    if (config.transactionType !== 'both') {
      transactions = transactions.filter(t => t.fields.Select === config.transactionType);
    }
    
    if (config.project !== 'all') {
      transactions = transactions.filter(t => t.fields.Project === config.project);
    }
    
    // Date filtering
    if (config.periodType === 'month' && config.periodValue) {
      const [year, month] = config.periodValue.split('-');
      transactions = transactions.filter(t => {
        const date = new Date(t.fields.Date);
        return date.getFullYear() == year && date.getMonth() == (month - 1);
      });
    }
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalVAT = 0;
    
    transactions.forEach(t => {
      const amount = parseFloat(t.fields.Bedrag || 0);
      const vat = parseFloat(t.fields['BTW Bedrag'] || 0);
      
      if (t.fields.Select === 'Inkomsten') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
      totalVAT += vat;
    });
    
    // Sort transactions
    transactions.sort((a, b) => {
      const dateA = new Date(a.fields.Date || 0);
      const dateB = new Date(b.fields.Date || 0);
      return dateB - dateA;
    });
    
    const reportData = {
      transactions: transactions,
      summary: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netResult: totalIncome - totalExpenses,
        totalVAT: totalVAT,
        transactionCount: transactions.length,
        period: getPeriodDescription(config)
      },
      config: config
    };
    
    return {
      success: true,
      data: reportData,
      message: `Report generated with ${transactions.length} transactions`
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'generateReport' });
  }
}

function getPeriodDescription(config) {
  switch(config.periodType) {
    case 'month':
      return `Month: ${config.periodValue}`;
    case 'quarter':
      return `Quarter: ${config.periodValue}`;
    case 'year':
      return `Year: ${config.periodValue}`;
    default:
      return 'All periods';
  }
}

function exportReportToPDF(reportData) {
  try {
    const timestamp = new Date().toISOString().slice(0,10);
    const tempDoc = DocumentApp.create(`Financial_Report_${timestamp}_${Date.now()}`);
    const body = tempDoc.getBody();
    
    body.clear();
    
    // Header with styling and colors
    const header = body.appendParagraph('MORE IS MORE! Agency');
    header.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header.setForegroundColor('#2c5aa0');
    
    const subtitle = body.appendParagraph('FINANCIAL REPORT');
    subtitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    subtitle.setForegroundColor('#2c5aa0');
    
    body.appendParagraph(`Period: ${reportData.summary.period}`);
    body.appendParagraph(`Generated: ${new Date().toLocaleDateString('nl-BE')}`);
    body.appendParagraph('');
    
    // Summary with color coding
    const summaryHeader = body.appendParagraph('EXECUTIVE SUMMARY');
    summaryHeader.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    summaryHeader.setForegroundColor('#2c5aa0');
    
    const summaryTable = body.appendTable();
    const summaryHeaderRow = summaryTable.appendTableRow();
    const headerCell1 = summaryHeaderRow.appendTableCell('METRIC');
    const headerCell2 = summaryHeaderRow.appendTableCell('AMOUNT');
    headerCell1.setBackgroundColor('#2c5aa0');
    headerCell1.setForegroundColor('#ffffff');
    headerCell2.setBackgroundColor('#2c5aa0');
    headerCell2.setForegroundColor('#ffffff');
    
    const summaryData = [
      ['Total Income', `€${reportData.summary.totalIncome.toFixed(2)}`],
      ['Total Expenses', `€${reportData.summary.totalExpenses.toFixed(2)}`],
      ['Net Result', `€${reportData.summary.netResult.toFixed(2)}`],
      ['Total VAT', `€${reportData.summary.totalVAT.toFixed(2)}`],
      ['Transaction Count', reportData.summary.transactionCount.toString()]
    ];
    
    summaryData.forEach((row, index) => {
      const tableRow = summaryTable.appendTableRow();
      const labelCell = tableRow.appendTableCell(row[0]);
      const amountCell = tableRow.appendTableCell(row[1]);
      
      // Alternate row colors
      if (index % 2 === 1) {
        labelCell.setBackgroundColor('#f8f9fa');
        amountCell.setBackgroundColor('#f8f9fa');
      }
      
      // Color code net result
      if (row[0] === 'Net Result') {
        amountCell.setForegroundColor(reportData.summary.netResult >= 0 ? '#10b981' : '#ef4444');
      }
    });
    
    body.appendParagraph('');
    
    // Detailed transactions with columns and colors
    if (reportData.transactions && reportData.transactions.length > 0) {
      const detailHeader = body.appendParagraph('DETAILED TRANSACTIONS');
      detailHeader.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      detailHeader.setForegroundColor('#2c5aa0');
      
      const table = body.appendTable();
      const headerRow = table.appendTableRow();
      
      // Header with blue background
      ['Date', 'Type', 'Description', 'Project', 'Amount', 'VAT', 'Total'].forEach(header => {
        const cell = headerRow.appendTableCell(header);
        cell.setBackgroundColor('#2c5aa0');
        cell.setForegroundColor('#ffffff');
      });
      
      // Data rows with alternating colors - FIXED
      reportData.transactions.forEach((transaction, index) => {
        const fields = transaction.fields;
        const row = table.appendTableRow();
        
        // Create all cells first
        const dateCell = row.appendTableCell(new Date(fields.Date).toLocaleDateString('nl-BE'));
        const typeCell = row.appendTableCell(fields.Select || '');
        const descCell = row.appendTableCell(fields.Beschrijving || '');
        const projectCell = row.appendTableCell(fields.Project || '');
        const amountCell = row.appendTableCell(`€${(fields.Bedrag || 0).toFixed(2)}`);
        const vatCell = row.appendTableCell(`€${(fields['BTW Bedrag'] || 0).toFixed(2)}`);
        const totalCell = row.appendTableCell(`€${(fields.Totaal || 0).toFixed(2)}`);
        
        // Apply alternating row colors AFTER cells exist
        if (index % 2 === 1) {
          dateCell.setBackgroundColor('#f8f9fa');
          typeCell.setBackgroundColor('#f8f9fa');
          descCell.setBackgroundColor('#f8f9fa');
          projectCell.setBackgroundColor('#f8f9fa');
          amountCell.setBackgroundColor('#f8f9fa');
          vatCell.setBackgroundColor('#f8f9fa');
          totalCell.setBackgroundColor('#f8f9fa');
        }
        
        // Color code transaction type
        if (fields.Select === 'Inkomsten') {
          typeCell.setForegroundColor('#10b981');
        } else if (fields.Select === 'Uitgaven') {
          typeCell.setForegroundColor('#ef4444');
        }
      });
    } else {
      body.appendParagraph('No transactions found for the selected criteria.');
    }
    
    // Footer with company info
    body.appendParagraph('');
    const footer = body.appendParagraph(`Report generated by MORE IS MORE! Agency | ${COMPANY_INFO.vatNumber} | ${new Date().toLocaleDateString('nl-BE')}`);
    footer.setFontSize(9);
    footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footer.setForegroundColor('#666666');
    
    // CRITICAL: Save and close before PDF conversion
    tempDoc.saveAndClose();
    
    // Extended wait time for complex reports
    Utilities.sleep(3000);
    
    // Convert to PDF
    const pdfBlob = tempDoc.getAs('application/pdf');
    const folder = DriveApp.getFolderById(DRIVE_FOLDERS.REPORTS);
    const fileName = `Financial_Report_${timestamp}.pdf`;
    const file = folder.createFile(pdfBlob);
    file.setName(fileName);
    
    // Set permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Clean up
    DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
    
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      downloadUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
      directDownload: `https://drive.google.com/uc?export=download&id=${file.getId()}`
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'exportReportToPDF' });
  }
}

// ==================== UTILITY FUNCTIONS ====================
function testConnection() {
  const airtable = new AirtableService();
  const result = airtable.getRecords('Transacties', { maxRecords: 1 });
  
  if (result.success) {
    return {
      success: true,
      message: 'Connection successful',
      timestamp: new Date().toISOString()
    };
  } else {
    return result;
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('nl-BE');
}
