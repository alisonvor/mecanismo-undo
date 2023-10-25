
---

# Mecanismo de Logs com Node

Este projeto oferece um mecanismo para restaurar o banco de dados utilizando undo

## Pré-requisitos

- PostgreSQL 15.2
- Node.js 18.16.1

## Configuração

### 1. Clone o Repositório:

```bash
git clone https://github.com/alisonvor/mecanismo-undo.git
cd mecanismo-undo
```

### 2. Instale as Dependências:

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente:

Configure o acesso ao banco de dados alterando o nome do `.env.example` para `.env`

```
# PostgreSQL Configuration
PGUSER=dbuser                  # Usuário do banco de dados
PGHOST=localhost               # Servidor do banco de dados
PGDATABASE=mydb                # Nome do banco de dados
PGPASSWORD=mypassword          # Senha do usuário
PGPORT=5432                    # Porta (a padrão do PostgresSQL é 5432)
```

Substitua os valores de exemplo pelos reais de conexão do seu PostgreSQL.

### 4. Execute a Aplicação:

```bash
npm start
```

---