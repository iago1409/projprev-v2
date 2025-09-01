# Processo Trabalhista - Landing Page

Uma aplicação React para consulta e registro de processos trabalhistas por CPF.

## Funcionalidades

### Página Principal (/)
- **Busca por CPF**: Campo com máscara automática e validação
- **Resultados dinâmicos**: Lista que aparece conforme o usuário digita (debounce de 350ms)
- **Validação de CPF**: Inclui verificação de dígitos verificadores
- **Navegação inteligente**: Clique nos resultados leva para página de registro
- **CTA de cadastro**: Botão sempre visível para registrar novos trabalhadores

### Página de Registro (/registrar)
- Recebe CPF via querystring
- Estrutura preparada para formulário futuro

## Estrutura Técnica

### Repositório de Dados
O sistema implementa um padrão de repositório com duas implementações:teste do xandao

#### MockWorkerRepository (Atual)
- Dados em memória para demonstração
- Simula delay de consulta real
- Inclui trabalhadores fictícios

#### CSVWorkerRepository (Futuro)
- Estrutura preparada para integração com arquivos CSV
- Compatível com Excel
- **Importante**: Não usa .xlsx, apenas CSV

### Operações do Repositório
```typescript
interface WorkerRepository {
  searchByCpfPrefix(prefixDigitsOnly: string): Promise<WorkerSearchResult[]>;
  existsByCpf(cpfDigitsOnly: string): Promise<boolean>;
}
```

## Integração CSV Futura

Para ativar a fonte CSV, será necessário:

1. Criar arquivo CSV com colunas: `cpf,nome,count`
2. Implementar métodos da classe `CSVWorkerRepository` em `src/services/workerRepository.ts`
3. Modificar a factory `createWorkerRepository()` para usar CSV quando disponível
4. **Não criar arquivos .xlsx** - usar apenas CSV compatível com Excel

## Exemplo de CSV
```csv
cpf,nome,count
12345678901,MARIA SILVA SANTOS,4
12345678902,JOÃO OLIVEIRA COSTA,2
```

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run lint     # Verificação de código
```

## Tecnologias

- React 18 + TypeScript
- React Router DOM
- Tailwind CSS
- Lucide React (ícones)
- Vite

## Validações Implementadas

- Máscara automática de CPF durante digitação
- Validação de dígitos verificadores
- Bloqueio de sequências inválidas (111.111.111-11, etc.)
- Estados de erro visuais
- Debounce para otimizar consultas

## Design Responsivo

- Layout adaptativo para desktop e mobile
- Hierarquia visual clara
- Espaçamentos consistentes
- Estados de hover e foco
- Acessibilidade com navegação por teclado