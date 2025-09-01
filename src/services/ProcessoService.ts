interface EAVRecord {
  processo_id: string;
  tag_xml: string;
  valor: string;
  created_at: string;
  updated_at: string;
  origem: string;
  versao: number;
}

/**
 * Serviço para gerenciar dados do processo no formato EAV
 */
export class ProcessoService {
  private static storage: EAVRecord[] = [];

  /**
   * Salva dados do formulário no formato EAV
   */
  static async saveFormData(processoId: string, data: Record<string, string>): Promise<void> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    const timestamp = new Date().toISOString();

    for (const [tagXml, valor] of Object.entries(data)) {
      if (valor !== '') { // Só salvar campos preenchidos
        // Verificar se já existe um registro para este processo_id + tag_xml
        const existingIndex = this.storage.findIndex(
          record => record.processo_id === processoId && record.tag_xml === tagXml
        );

        if (existingIndex >= 0) {
          // Atualizar registro existente incrementando versão
          const existing = this.storage[existingIndex];
          this.storage[existingIndex] = {
            ...existing,
            valor,
            updated_at: timestamp,
            versao: existing.versao + 1
          };
        } else {
          // Criar novo registro
          const newRecord: EAVRecord = {
            processo_id: processoId,
            tag_xml: tagXml,
            valor,
            created_at: timestamp,
            updated_at: timestamp,
            origem: 'manual',
            versao: 1
          };
          this.storage.push(newRecord);
        }
      }
    }

    console.log('Dados salvos no formato EAV:', this.storage);
  }

  /**
   * Recupera dados de um processo
   */
  static async getProcessData(processoId: string): Promise<Record<string, string>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const processRecords = this.storage.filter(
      record => record.processo_id === processoId
    );

    const data: Record<string, string> = {};
    
    // Para cada tag_xml, pegar a versão mais recente
    const tagXmlVersions: Record<string, number> = {};
    
    processRecords.forEach(record => {
      if (!tagXmlVersions[record.tag_xml] || record.versao > tagXmlVersions[record.tag_xml]) {
        tagXmlVersions[record.tag_xml] = record.versao;
        data[record.tag_xml] = record.valor;
      }
    });

    return data;
  }

  /**
   * Limpa todos os dados (para testes)
   */
  static clearAll(): void {
    this.storage = [];
  }

  /**
   * Obtém todos os registros (para debug)
   */
  static getAllRecords(): EAVRecord[] {
    return [...this.storage];
  }

  /**
   * Limpa dados de um grupo específico de tags
   */
  static async clearGroupData(processoId: string, tagXmls: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));

    // Remove registros das tags especificadas
    this.storage = this.storage.filter(
      record => !(record.processo_id === processoId && tagXmls.includes(record.tag_xml))
    );

    console.log('Dados do grupo limpos:', tagXmls);
  }

  /**
   * Exporta dados em formato CSV
   */
  static exportToCSV(processoId?: string): string {
    const records = processoId 
      ? this.storage.filter(record => record.processo_id === processoId)
      : this.storage;

    if (records.length === 0) {
      return 'processo_id,tag_xml,valor,created_at,updated_at,origem,versao\n';
    }

    const header = 'processo_id,tag_xml,valor,created_at,updated_at,origem,versao\n';
    const rows = records.map(record => 
      `${record.processo_id},${record.tag_xml},"${record.valor}",${record.created_at},${record.updated_at},${record.origem},${record.versao}`
    ).join('\n');

    return header + rows;
  }

  /**
   * Força a persistência de um campo vazio (para limpeza)
   */
  static async clearField(processoId: string, tagXml: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));

    // Remove o registro da tag especificada
    this.storage = this.storage.filter(
      record => !(record.processo_id === processoId && record.tag_xml === tagXml)
    );

    console.log(`Campo ${tagXml} limpo para processo ${processoId}`);
  }
}