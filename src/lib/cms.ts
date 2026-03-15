import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { SiteContent, Article, GalleryImage } from '../types';

export const getContent = async (id: string): Promise<string | null> => {
  try {
    const docRef = doc(db, 'content', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().value;
    }
    return null;
  } catch (error) {
    console.error("Error getting content:", error);
    return null;
  }
};

export const saveContent = async (id: string, value: string, type: string = 'text', section: string = 'general') => {
  try {
    await setDoc(doc(db, 'content', id), {
      id,
      value,
      type,
      section,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving content:", error);
  }
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const getArticles = async (): Promise<Article[]> => {
  const q = query(collection(db, 'articles'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

export const saveArticle = async (article: Article) => {
  const docRef = article.id ? doc(db, 'articles', article.id) : doc(collection(db, 'articles'));
  await setDoc(docRef, { ...article, updatedAt: new Date().toISOString() });
};

export const deleteArticle = async (id: string) => {
  await deleteDoc(doc(db, 'articles', id));
};
