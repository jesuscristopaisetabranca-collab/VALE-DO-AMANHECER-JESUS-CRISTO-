# Documentação do Portal Editável

Este portal foi transformado em um site totalmente editável utilizando Firebase (Firestore e Storage).

## Como acessar o Painel Administrativo

1.  Acesse a URL: `https://seu-portal.vercel.app/login`
2.  Faça login com seu e-mail e senha cadastrados no Firebase.
3.  Após o login, você será redirecionado para `https://seu-portal.vercel.app/admin`.

## Funcionalidades do Painel (/admin)

### 1. Edição de Conteúdo Geral
Na aba **"Conteúdo"**, você pode visualizar todos os textos e imagens que foram marcados como editáveis no site.
- Clique no ícone de edição para alterar o valor.
- Para imagens, você pode fazer o upload de um novo arquivo diretamente.

### 2. Gestão de Artigos
Na aba **"Artigos"**, você pode criar, editar e excluir postagens do blog/notícias.
- Utilizamos um editor visual (estilo Notion/Quill) para formatar o texto.
- Você pode adicionar uma imagem de capa para cada artigo.

### 3. Galeria de Mídia
Na aba **"Galeria"**, você pode gerenciar as fotos e vídeos do portal.
- Faça upload de novas imagens.
- Adicione links de vídeos (YouTube/Vimeo).

## Como editar diretamente no site (Modo Edição)

Se você estiver logado como administrador e acessar a página inicial, verá uma barra azul no topo indicando o **"Modo Edição"**.
- **Textos:** Clique em qualquer texto editável para abrir o campo de edição. Salve para aplicar as mudanças em tempo real.
- **Imagens:** Passe o mouse sobre uma imagem e clique no botão "Alterar Imagem" para fazer o upload de uma nova foto.

## Armazenamento

- **Dados:** Todos os textos, links e metadados são salvos no **Firebase Firestore**.
- **Arquivos:** Imagens e vídeos enviados são armazenados no **Firebase Storage**.

## Configuração Técnica

Certifique-se de que as seguintes variáveis de ambiente estão configuradas no seu projeto (Vercel/Firebase):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
