import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import mammoth from 'mammoth/mammoth.browser'; // Importante usar la versión del navegador

export default function App() {
  const [loading, setLoading] = useState(false);

  const seleccionarYConvertir = async () => {
    try {
      // 1. Seleccionar el archivo DOCX
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Filtro para .docx
      });

      if (result.canceled || !result.assets) return;

      setLoading(true);
      const docxUri = result.assets[0].uri;

      // 2. Leer el archivo en formato ArrayBuffer (necesario para Mammoth)
      // Convertimos primero a Base64 y luego a ArrayBuffer
  const base64Data = await FileSystem.readAsStringAsync(docxUri, {
  encoding: 'base64',

      });
      const arrayBuffer = _base64ToArrayBuffer(base64Data);

      // 3. Convertir de DOCX a HTML usando Mammoth
      const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

      // Opcional: Agregar estilos CSS básicos para que el PDF no se vea tan plano
      const htmlEstilizado = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
              h1, h2, h3 { color: #333; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      // 4. Convertir el HTML a PDF usando el motor nativo
      const { uri: pdfUri } = await Print.printToFileAsync({
        html: htmlEstilizado,
      });

      setLoading(false);

      // 5. Compartir o guardar el archivo PDF generado
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert("Éxito", "PDF generado en: " + pdfUri);
      }

    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "No se pudo procesar el archivo.");
    }
  };

  // Función utilitaria para convertir Base64 a ArrayBuffer
  const _base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversor DOCX a PDF Offline</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Seleccionar archivo .docx" onPress={seleccionarYConvertir} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
});