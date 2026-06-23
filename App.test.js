import React from 'react';

// Mocks de las librerías nativas de Expo
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' }
}));
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(),
}));

describe('Pruebas unitarias de inicialización', () => {
  it('el componente App carga sus dependencias sin romperse', () => {
    // Importamos App dinámicamente aquí dentro para verificar que su estructura de código compila
    const App = require('./App').default;
    
    expect(App).toBeDefined();
  });

  it('los mocks de las dependencias nativas están operativos', async () => {
    const DocumentPicker = require('expo-document-picker');
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: true });
    
    const resultado = await DocumentPicker.getDocumentAsync();
    expect(resultado.canceled).toBe(true);
  });
});