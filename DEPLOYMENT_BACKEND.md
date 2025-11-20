# Guia de Implantação do Backend PriTapia ONG

Este guia explica como implantar a API PHP do backend para a aplicação React PriTapia ONG no hospedagem cPanel.

## Pré-requisitos

- Conta de hospedagem cPanel com suporte a PHP e MySQL
- Acesso ao File Manager do cPanel e PhpMyAdmin
- Acesso FTP para upload de arquivos

## Passo 1: Configuração do Banco de Dados

1. Faça login no cPanel e vá para **MySQL Databases**
2. Crie um novo banco de dados chamado `hg0e7639_PriTapia`
3. Crie um usuário do banco de dados e atribua todas as permissões para este banco
4. Abra o **PhpMyAdmin** e selecione o banco `hg0e7639_PriTapia`
5. Vá para a aba **SQL** e execute o conteúdo do `database_setup.sql` para criar as tabelas
6. Execute o conteúdo do `database_inserts.sql` para inserir dados padrão

## Passo 2: Upload dos Arquivos do Backend

1. Faça upload de toda a pasta `backend/` para seu diretório `public_html` via FTP
2. A estrutura deve ficar assim:
   ```
   public_html/
   ├── backend/
   │   ├── config.php
   │   └── api/
   │       ├── users.php
   │       ├── login.php
   │       ├── clients.php
   │       ├── appointments.php
   │       ├── products.php
   │       ├── transactions.php
   │       ├── settings.php
   │       ├── audit_logs.php
   │       ├── statistics.php
   │       └── session.php
   ```

## Passo 3: Configurar Conexão do Banco de Dados

1. Edite `backend/config.php`
2. Atualize as credenciais do banco de dados:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'seu_usuario_cpanel_dbuser'); // Seu nome de usuário do banco cPanel
   define('DB_PASS', 'sua_senha_db');               // Sua senha do banco de dados
   define('DB_NAME', 'hg0e7639_PriTapia');        // Nome do seu banco de dados
   ```

## Passo 4: Compilar e Fazer Upload do Frontend

1. No seu projeto local, execute:
   ```bash
   npm run build
   ```
2. Faça upload do conteúdo da pasta `dist` ou `build` para `public_html/`
3. Certifique-se de que `index.html` e outros assets estão na raiz

## Passo 5: Configurar URL Base da API

Se seu backend não estiver em `/backend/api/`, atualize o `apiBase` em `src/services/database.ts`:

```typescript
private apiBase = '/seu/caminho/backend/api/';
```

## Passo 6: Testar a Aplicação

1. Visite a URL do seu site
2. Tente fazer login com as credenciais padrão:
   - Usuário: `admin@pritapia.com`
   - Senha: `PriTapia2024!`
3. Teste várias funcionalidades (clientes, agendamentos, etc.)

## Solução de Problemas

### Página Branca em Branco
- Verifique os logs de erro do PHP no cPanel
- Certifique-se de que todos os arquivos foram enviados corretamente
- Verifique a conexão do banco de dados em `config.php`

### Erros da API
- Verifique o console do navegador para erros de fetch
- Confirme se os caminhos da API correspondem à sua implantação
- Certifique-se de que os cabeçalhos CORS estão definidos (já configurados em config.php)

### Problemas de Conexão do Banco de Dados
- Confirme as credenciais do banco de dados
- Verifique se o banco de dados e as tabelas existem
- Verifique as permissões do usuário

## Notas de Segurança

- Altere a senha padrão do admin após o primeiro login
- Considere adicionar certificado HTTPS/SSL
- Faça backup regular do seu banco de dados
- Monitore os logs de auditoria para atividades suspeitas

## Estrutura de Arquivos Após Implantação

```
public_html/
├── index.html          # Entrada da aplicação React
├── assets/            # Assets de compilação React
├── backend/
│   ├── config.php
│   └── api/
│       ├── *.php      # Endpoints da API
└── .htaccess          # (se necessário para roteamento)
```

## Dados Padrão

O banco de dados vem pré-populado com:
- 1 Usuário admin (admin@pritapia.com / PriTapia2024!)
- Dados de castração de exemplo
- Novidades e atualizações da ONG
- Configurações padrão da PriTapia

Lembre-se de alterar a senha padrão e personalizar as configurações para uso em produção.