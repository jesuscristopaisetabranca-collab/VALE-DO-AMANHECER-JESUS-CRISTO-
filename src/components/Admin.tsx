import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Save, 
  Trash2, 
  ChevronRight,
  Search,
  Globe,
  PlusCircle,
  Edit3,
  Upload,
  X
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [contents, setContents] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchData();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    const contentSnap = await getDocs(collection(db, 'content'));
    setContents(contentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const articleSnap = await getDocs(collection(db, 'articles'));
    setArticles(articleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleSaveContent = async (id: string, value: string) => {
    await setDoc(doc(db, 'content', id), { value, updatedAt: new Date().toISOString() }, { merge: true });
    fetchData();
    setEditingItem(null);
  };

  const handleUpload = async (file: File, folder: string) => {
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-bottom border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Layout className="w-5 h-5" />
            Conteúdo Geral
          </button>
          <button 
            onClick={() => setActiveTab('articles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'articles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" />
            Artigos / Blog
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'media' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Mídia / Galeria
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === 'content' && 'Conteúdo Geral'}
              {activeTab === 'articles' && 'Artigos e Blog'}
              {activeTab === 'media' && 'Gerenciador de Mídia'}
            </h1>
            <p className="text-slate-400 mt-1">Gerencie o conteúdo do seu portal em tempo real</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
            >
              <Globe className="w-4 h-4" />
              Ver Site
            </button>
            {activeTab === 'articles' && (
              <button 
                onClick={() => setEditingItem({ title: '', content: '', excerpt: '', date: new Date().toISOString().split('T')[0] })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                Novo Artigo
              </button>
            )}
          </div>
        </header>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar conteúdo por ID..." 
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
              <div className="divide-y divide-slate-800">
                {contents.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-800/30 transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs font-mono text-blue-500 uppercase tracking-wider">{item.id}</span>
                      <p className="text-slate-300 mt-1 line-clamp-1">{item.value}</p>
                    </div>
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="p-2 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map(article => (
              <div key={article.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group">
                {article.image && (
                  <div className="aspect-video overflow-hidden">
                    <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-lg line-clamp-1">{article.title}</h3>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-xs text-slate-500">{article.date}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingItem(article)}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => { if(confirm('Excluir artigo?')) { await deleteDoc(doc(db, 'articles', article.id)); fetchData(); } }}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-rose-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Upload de Mídia</h3>
              <p className="text-slate-400 mt-2 max-w-xs">Arraste arquivos ou clique para selecionar (Imagens ou Vídeos)</p>
              <input 
                type="file" 
                className="hidden" 
                id="media-upload" 
                onChange={async (e) => {
                  if(e.target.files?.[0]) {
                    const url = await handleUpload(e.target.files[0], 'gallery');
                    await setDoc(doc(collection(db, 'gallery')), { url, createdAt: new Date().toISOString() });
                    alert('Upload concluído!');
                  }
                }}
              />
              <label 
                htmlFor="media-upload"
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-blue-900/20"
              >
                Selecionar Arquivo
              </label>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h2 className="text-xl font-bold">Editando: {editingItem.id || editingItem.title || 'Novo Item'}</h2>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-800 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {activeTab === 'content' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Valor do Conteúdo</label>
                  <textarea 
                    value={editingItem.value}
                    onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[200px]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Título</label>
                    <input 
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Resumo (Excerpt)</label>
                    <textarea 
                      value={editingItem.excerpt}
                      onChange={(e) => setEditingItem({...editingItem, excerpt: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Conteúdo (Notion-style Editor)</label>
                    <div className="bg-white text-black rounded-xl overflow-hidden">
                      <ReactQuill 
                        theme="snow" 
                        value={editingItem.content} 
                        onChange={(val) => setEditingItem({...editingItem, content: val})}
                        className="h-64"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Data</label>
                      <input 
                        type="date"
                        value={editingItem.date}
                        onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">URL da Imagem</label>
                      <input 
                        type="text"
                        value={editingItem.image}
                        onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900">
              <button 
                onClick={() => setEditingItem(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if(activeTab === 'content') {
                    await setDoc(doc(db, 'content', editingItem.id), editingItem);
                  } else {
                    const docRef = editingItem.id ? doc(db, 'articles', editingItem.id) : doc(collection(db, 'articles'));
                    await setDoc(docRef, editingItem);
                  }
                  fetchData();
                  setEditingItem(null);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
