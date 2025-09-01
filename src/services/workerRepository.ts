import { Worker, WorkerSearchResult } from '../types';
import { maskCPFForDisplay, removeCPFMask } from '../utils/cpfUtils';

// Interface para o repositório
export interface WorkerRepository {
  searchByCpfPrefix(prefixDigitsOnly: string): Promise<WorkerSearchResult[]>;
  existsByCpf(cpfDigitsOnly: string): Promise<boolean>;
}

// Mock de dados em memória
const mockWorkers: Worker[] = [
  { cpf: '12345678901', name: 'MARIA SILVA SANTOS', count: 4 },
  { cpf: '12345678902', name: 'JOÃO OLIVEIRA COSTA', count: 2 },
  { cpf: '12398765432', name: 'ANA PAULA FERREIRA', count: 1 },
  { cpf: '11122233344', name: 'CARLOS EDUARDO LIMA', count: 3 },
  { cpf: '55566677788', name: 'FERNANDA RODRIGUES ALMEIDA', count: 5 },
  { cpf: '99988877766', name: 'RICARDO MENDES BARBOSA', count: 2 },
  { cpf: '44455566677', name: 'PATRICIA GOMES SILVA', count: 1 },
  { cpf: '33344455566', name: 'ANDERSON PEREIRA SANTOS', count: 4 },
];

// Implementação mock do repositório
export class MockWorkerRepository implements WorkerRepository {
  async searchByCpfPrefix(prefixDigitsOnly: string): Promise<WorkerSearchResult[]> {
    // Simula delay de consulta
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const results = mockWorkers
      .filter(worker => worker.cpf.startsWith(prefixDigitsOnly))
      .slice(0, 10) // Limita resultados
      .map(worker => ({
        cpfWithoutMask: worker.cpf,
        cpfMasked: maskCPFForDisplay(worker.cpf),
        displayText: `${maskCPFForDisplay(worker.cpf)} | ${worker.count} : ${worker.name}`
      }));
    
    return results;
  }
  
  async existsByCpf(cpfDigitsOnly: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockWorkers.some(worker => worker.cpf === cpfDigitsOnly);
  }
}

// Implementação futura para CSV (estrutura preparada)
export class CSVWorkerRepository implements WorkerRepository {
  private csvFilePath: string;
  
  constructor(csvFilePath: string) {
    this.csvFilePath = csvFilePath;
  }
  
  async searchByCpfPrefix(prefixDigitsOnly: string): Promise<WorkerSearchResult[]> {
    // TODO: Implementar leitura do CSV
    // 1. Ler arquivo CSV do caminho especificado
    // 2. Parsear dados (cpf, nome, count)
    // 3. Filtrar por prefixo do CPF
    // 4. Retornar resultados formatados
    throw new Error('CSV repository not implemented yet');
  }
  
  async existsByCpf(cpfDigitsOnly: string): Promise<boolean> {
    // TODO: Implementar verificação de existência no CSV
    throw new Error('CSV repository not implemented yet');
  }
}

// Factory para criação do repositório
export const createWorkerRepository = (): WorkerRepository => {
  // Por enquanto sempre retorna o mock
  // No futuro, verificar se existe arquivo CSV e usar CSVWorkerRepository
  return new MockWorkerRepository();
};