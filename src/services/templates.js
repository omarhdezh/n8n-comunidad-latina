// src/services/templates.js
import { 
    collection, addDoc, getDocs, getDoc, doc, 
    query, where, orderBy, deleteDoc, updateDoc,
    increment, limit
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
  import { db, storage } from './firebase';
  
  // Colección de plantillas
  const templatesCollection = collection(db, 'templates');
  
  // Obtener todas las plantillas
  export const getAllTemplates = async () => {
    const q = query(templatesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  // Obtener plantillas populares
  export const getPopularTemplates = async (limitCount = 10) => {
    const q = query(templatesCollection, orderBy('downloads', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  // Obtener plantillas por categoría
  export const getTemplatesByCategory = async (category) => {
    const q = query(templatesCollection, where('category', '==', category), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  // Obtener plantilla por ID
  export const getTemplateById = async (id) => {
    const docRef = doc(db, 'templates', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('La plantilla no existe');
    }
  };
  
  // Subir una nueva plantilla
  export const uploadTemplate = async (templateData, file) => {
    try {
      // 1. Subir el archivo al Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const fileRef = ref(storage, `templates/${fileName}`);
      
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      
      // 2. Crear el documento de la plantilla en Firestore
      const templateWithFile = {
        ...templateData,
        fileUrl,
        fileName,
        filePath: `templates/${fileName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        downloads: 0
      };
      
      const docRef = await addDoc(templatesCollection, templateWithFile);
      
      return {
        id: docRef.id,
        ...templateWithFile
      };
    } catch (error) {
      console.error('Error al subir la plantilla:', error);
      throw error;
    }
  };
  
  // Eliminar una plantilla
  export const deleteTemplate = async (templateId) => {
    try {
      // 1. Obtener la información de la plantilla
      const template = await getTemplateById(templateId);
      
      // 2. Eliminar el archivo del Storage
      const fileRef = ref(storage, template.filePath);
      await deleteObject(fileRef);
      
      // 3. Eliminar el documento de la plantilla
      await deleteDoc(doc(db, 'templates', templateId));
      
      return true;
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
      throw error;
    }
  };
  
  // Registrar una descarga
  export const incrementDownload = async (templateId) => {
    const templateRef = doc(db, 'templates', templateId);
    await updateDoc(templateRef, {
      downloads: increment(1)
    });
  };
  
  // Buscar plantillas
  export const searchTemplates = async (searchTerm) => {
    const q = query(templatesCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    
    // Filtramos en el cliente porque Firestore no soporta búsquedas de texto completo
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  };
  