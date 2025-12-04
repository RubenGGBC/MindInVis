class IAService{
    constructor(apiKey=null,model='gpt-3.5-turbo'){
        this.apiKey=apiKey
        this.model=model
    }
    setApikey(apik){
        this.apiKey=apik
    }
    setModel(model){
        this.model=model
    }
    async generateNodes(question){
        const res=this.getMockRes(question);

    }
    getMockResponses(question){
        const lower=question.toLowerCase();
     if (lower.includes('ia') || lower.includes('inteligencia artificial')) {
        return [
          'Machine Learning',
          'Redes Neuronales',
          'Procesamiento de Lenguaje',
          'Visión por Computadora'
        ];
      }

      if (lower.includes('programación') || lower.includes('código')) {
        return [
          'Frontend',
          'Backend',
          'Base de Datos',
          'DevOps'
        ];
      }

      return [
        'Concepto 1',
        'Concepto 2',
        'Concepto 3'
      ];
   
    }

}

export default IAService; 