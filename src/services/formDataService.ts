import { FormField, ContratoFormData } from '../types';

// Simulação de persistência em memória (futuramente será CSV/banco)
const formDataStorage = new Map<string, FormField[]>();

export class FormDataService {
  static async saveField(cpf: string, tagXml: string, valor: string): Promise<void> {
    const key = `${cpf}_${tagXml}`;
    const existingFields = formDataStorage.get(cpf) || [];
    
    // Encontrar versão atual para esta tag
    const existingField = existingFields.find(f => f.tag_xml === tagXml);
    const versao = existingField ? existingField.versao + 1 : 1;
    
    const newField: FormField = {
      cpf,
      tag_xml: tagXml,
      valor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      origem: 'manual',
      versao
    };
    
    // Remover campo anterior se existir
    const filteredFields = existingFields.filter(f => f.tag_xml !== tagXml);
    filteredFields.push(newField);
    
    formDataStorage.set(cpf, filteredFields);
    
    // Simular delay de persistência
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  static async getFormData(cpf: string): Promise<ContratoFormData> {
    const fields = formDataStorage.get(cpf) || [];
    
    const getData = (tagXml: string): string => {
      const field = fields.find(f => f.tag_xml === tagXml);
      return field ? field.valor : '';
    };
    
    return {
      tpContr: getData('tpContr'),
      matricula: getData('matricula'),
      dtInicio: getData('dtInicio'),
      dtAdmOrig: getData('dtAdmOrig'),
      indReintegr: getData('indReintegr'),
      indContr: getData('indContr') || 'S' // Default para S
    };
  }
  
  static async getIndicadoresData(cpf: string): Promise<any> {
    const fields = formDataStorage.get(cpf) || [];
    
    const getData = (tagXml: string): string => {
      const field = fields.find(f => f.tag_xml === tagXml);
      return field ? field.valor : '';
    };
    
    return {
      indReint: getData('indReint'),
      indCateg: getData('indCateg'),
      indNatAtiv: getData('indNatAtiv'),
      indMotDeslig: getData('indMotDeslig')
    };
  }

  static async saveFormData(cpf: string, formData: Partial<ContratoFormData>): Promise<void> {
    const promises = Object.entries(formData).map(([key, value]) => {
      if (value !== undefined && value !== '') {
        return this.saveField(cpf, key, value);
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  }
  
  static async saveIndicadoresData(cpf: string, formData: any): Promise<void> {
    const promises = Object.entries(formData).map(([key, value]) => {
      if (value !== undefined && value !== '') {
        return this.saveField(cpf, key, value as string);
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  }

  static async getMudancaCategoriaData(cpf: string): Promise<any> {
    const fields = formDataStorage.get(cpf) || [];
    
    const getData = (tagXml: string): string => {
      const field = fields.find(f => f.tag_xml === tagXml);
      return field ? field.valor : '';
    };
    
    return {
      codCateg: getData('codCateg'),
      natAtividade: getData('natAtividade'),
      dtMudCategAtiv: getData('dtMudCategAtiv')
    };
  }

  static async saveMudancaCategoriaData(cpf: string, formData: any): Promise<void> {
    const promises = Object.entries(formData).map(([key, value]) => {
      if (value !== undefined && value !== '') {
        return this.saveField(cpf, key, value as string);
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  }

  static async clearFormData(cpf: string): Promise<void> {
    formDataStorage.delete(cpf);
  }

  // Métodos para vínculos incorporados
  static async getVinculosIncorporados(cpf: string): Promise<any[]> {
    const fields = formDataStorage.get(cpf) || [];
    const vinculosField = fields.find(f => f.tag_xml === 'vinculosIncorporados');
    
    if (vinculosField && vinculosField.valor) {
      try {
        return JSON.parse(vinculosField.valor);
      } catch (error) {
        console.error('Erro ao parsear vínculos:', error);
        return [];
      }
    }
    
    return [];
  }

  static async saveVinculosIncorporados(cpf: string, vinculos: any[]): Promise<void> {
    const vinculosJson = JSON.stringify(vinculos);
    await this.saveField(cpf, 'vinculosIncorporados', vinculosJson);
  }
}