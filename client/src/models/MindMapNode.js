class MindMapNode {
  constructor(id, text, x, y, tipo, description = '', source = '') {
    // Identificación y contenido
    this.id = id;
    this.text = text;
    this.tipo = tipo;
    this.description = description;
    this.source = source;

    // Posición
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;

    // Dimensiones y estilo
    this.width = 200;
    this.height = 80;
    this.fontSize = 16;

    // Asignar colores basados en tipo y configuración guardada
    if (tipo === 'pregunta') {
      this.backgroundColor = localStorage.getItem('mindinvis_pregunta_bg') || '#1e3a8a';
      this.borderColor = localStorage.getItem('mindinvis_pregunta_border') || '#3b82f6';
    } else if (tipo === 'respuesta') {
      this.backgroundColor = localStorage.getItem('mindinvis_respuesta_bg') || '#065f46';
      this.borderColor = localStorage.getItem('mindinvis_respuesta_border') || '#10b981';
    } else if (tipo === 'root') {
      this.backgroundColor = '#581c87';
      this.borderColor = '#8b5cf6';
    } else {
      this.backgroundColor = '#0f1419';
      this.borderColor = '#8b5cf6';
    }
    this.borderWidth = 2;

    // Relaciones (sin referencia parent para evitar circularidad)
    this.children = [];

    // Metadatos
    this.collapsed = false;
    this.hasGeneratedChildren = false;
    this.createdAt = Date.now();
    this.lastModified = Date.now();
  }

  /**
   * Crea un nodo hijo con posición relativa
   * NOTA: No mantiene referencia parent para evitar referencias circulares
   */
  createChild(text, offsetX, offsetY, tipo, description = '', source = '') {
    const childNode = new MindMapNode(
      `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text,
      this.x + offsetX,
      this.y + offsetY,
      tipo,
      description,
      source
    );
    return childNode;
  }

  /**
   * Añade un nodo hijo existente a este nodo
   */
  addChild(childNode) {
    this.children.push(childNode);
    this.lastModified = Date.now();
    return childNode;
  }

  /**
   * Serializa el nodo a JSON para guardar/persistir
   */
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      tipo: this.tipo,
      description: this.description,
      source: this.source,
      x: this.x,
      y: this.y,
      initialX: this.initialX,
      initialY: this.initialY,
      width: this.width,
      height: this.height,
      fontSize: this.fontSize,
      backgroundColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      collapsed: this.collapsed,
      hasGeneratedChildren: this.hasGeneratedChildren,
      createdAt: this.createdAt,
      lastModified: this.lastModified,
      children: this.children.map(child => child.toJSON())
    };
  }

  /**
   * Deserializa un nodo desde JSON con validación
   */
  static fromJSON(data) {
    // Validación de datos requeridos
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid node data: must be an object');
    }

    if (!data.id || typeof data.id !== 'string') {
      throw new Error('Invalid node data: id is required and must be a string');
    }

    if (typeof data.text !== 'string') {
      throw new Error('Invalid node data: text must be a string');
    }

    if (typeof data.x !== 'number' || typeof data.y !== 'number') {
      throw new Error('Invalid node data: x and y must be numbers');
    }

    // Crear nodo con valores validados
    const node = new MindMapNode(
      data.id,
      data.text,
      data.x,
      data.y,
      data.tipo || 'pregunta',
      data.description || '',
      data.source || ''
    );

    // Restaurar posiciones iniciales
    node.initialX = typeof data.initialX === 'number' ? data.initialX : data.x;
    node.initialY = typeof data.initialY === 'number' ? data.initialY : data.y;

    // Restaurar propiedades visuales con valores por defecto
    node.width = typeof data.width === 'number' && data.width > 0 ? data.width : 200;
    node.height = typeof data.height === 'number' && data.height > 0 ? data.height : 80;
    node.fontSize = typeof data.fontSize === 'number' && data.fontSize > 0 ? data.fontSize : 16;
    // Use constructor-assigned defaults when stored data doesn't include colors
    node.backgroundColor = typeof data.backgroundColor === 'string' ? data.backgroundColor : node.backgroundColor;
    node.borderColor = typeof data.borderColor === 'string' ? data.borderColor : node.borderColor;
    node.borderWidth = typeof data.borderWidth === 'number' && data.borderWidth >= 0 ? data.borderWidth : 2;

    // Restaurar metadatos
    node.collapsed = Boolean(data.collapsed);
    node.hasGeneratedChildren = Boolean(data.hasGeneratedChildren);
    node.createdAt = typeof data.createdAt === 'number' ? data.createdAt : Date.now();
    node.lastModified = typeof data.lastModified === 'number' ? data.lastModified : Date.now();

    // Restaurar hijos recursivamente con manejo de errores
    if (Array.isArray(data.children)) {
      node.children = data.children
        .map((childData, index) => {
          try {
            return MindMapNode.fromJSON(childData);
          } catch (error) {
            console.error(`Error deserializing child ${index}:`, error);
            return null;
          }
        })
        .filter(child => child !== null);
    }

    return node;
  }

  /**
   * Clona este nodo (shallow - sin hijos)
   */
  clone() {
    const cloned = new MindMapNode(
      `${this.id}-clone-${Date.now()}`,
      this.text,
      this.x,
      this.y,
      this.tipo,
      this.description,
      this.source
    );

    cloned.initialX = this.initialX;
    cloned.initialY = this.initialY;
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.fontSize = this.fontSize;
    cloned.backgroundColor = this.backgroundColor;
    cloned.borderColor = this.borderColor;
    cloned.borderWidth = this.borderWidth;
    cloned.collapsed = this.collapsed;
    cloned.hasGeneratedChildren = this.hasGeneratedChildren;

    return cloned;
  }

  /**
   * Clona este nodo y todos sus hijos (deep clone)
   */
  deepClone() {
    const cloned = this.clone();
    cloned.children = this.children.map(child => child.deepClone());
    return cloned;
  }
}

export default MindMapNode;
