/**
 * Utilidades para trabajar con árboles de nodos de forma inmutable
 */

/**
 * Encuentra un nodo por su ID en el árbol
 * @param {Object} tree - Nodo raíz del árbol
 * @param {string} nodeId - ID del nodo a buscar
 * @returns {Object|null} - El nodo encontrado o null
 */
export function findNodeById(tree, nodeId) {
  if (!tree) return null;
  if (tree.id === nodeId) return tree;

  if (tree.children && tree.children.length > 0) {
    for (const child of tree.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Actualiza un nodo específico en el árbol de forma inmutable
 * @param {Object} tree - Nodo raíz del árbol
 * @param {string} nodeId - ID del nodo a actualizar
 * @param {Function} updateFn - Función que recibe el nodo y devuelve las propiedades actualizadas
 * @returns {Object} - Nuevo árbol con el nodo actualizado
 */
export function updateNode(tree, nodeId, updateFn) {
  if (!tree) return tree;

  if (tree.id === nodeId) {
    const updates = updateFn(tree);
    return {
      ...tree,
      ...updates,
      lastModified: Date.now()
    };
  }

  if (tree.children && tree.children.length > 0) {
    const newChildren = tree.children.map(child =>
      updateNode(child, nodeId, updateFn)
    );

    // Solo crear nuevo objeto si algún hijo cambió
    const hasChanged = newChildren.some((child, idx) => child !== tree.children[idx]);
    if (hasChanged) {
      return {
        ...tree,
        children: newChildren
      };
    }
  }

  return tree;
}

/**
 * Añade un nodo hijo a un nodo específico
 * @param {Object} tree - Nodo raíz del árbol
 * @param {string} parentId - ID del nodo padre
 * @param {Object} newChild - Nuevo nodo hijo a añadir
 * @returns {Object} - Nuevo árbol con el hijo añadido
 */
export function addChildToNode(tree, parentId, newChild) {
  if (!tree) return tree;

  if (tree.id === parentId) {
    return {
      ...tree,
      children: [...tree.children, newChild],
      lastModified: Date.now()
    };
  }

  if (tree.children && tree.children.length > 0) {
    const newChildren = tree.children.map(child =>
      addChildToNode(child, parentId, newChild)
    );

    const hasChanged = newChildren.some((child, idx) => child !== tree.children[idx]);
    if (hasChanged) {
      return {
        ...tree,
        children: newChildren
      };
    }
  }

  return tree;
}

/**
 * Elimina un nodo del árbol
 * @param {Object} tree - Nodo raíz del árbol
 * @param {string} nodeId - ID del nodo a eliminar
 * @returns {Object|null} - Nuevo árbol sin el nodo (null si se eliminó la raíz)
 */
export function deleteNode(tree, nodeId) {
  if (!tree) return null;

  // No permitir eliminar la raíz
  if (tree.id === nodeId) {
    return null;
  }

  if (tree.children && tree.children.length > 0) {
    const newChildren = tree.children
      .filter(child => child.id !== nodeId)
      .map(child => deleteNode(child, nodeId));

    const hasChanged =
      newChildren.length !== tree.children.length ||
      newChildren.some((child, idx) => child !== tree.children[idx]);

    if (hasChanged) {
      return {
        ...tree,
        children: newChildren,
        lastModified: Date.now()
      };
    }
  }

  return tree;
}

/**
 * Cuenta el número total de nodos en el árbol
 * @param {Object} tree - Nodo raíz del árbol
 * @returns {number} - Número total de nodos
 */
export function countNodes(tree) {
  if (!tree) return 0;

  let count = 1; // Contar este nodo

  if (tree.children && tree.children.length > 0) {
    count += tree.children.reduce((sum, child) => sum + countNodes(child), 0);
  }

  return count;
}

/**
 * Obtiene la profundidad máxima del árbol
 * @param {Object} tree - Nodo raíz del árbol
 * @returns {number} - Profundidad máxima
 */
export function getMaxDepth(tree) {
  if (!tree) return 0;

  if (!tree.children || tree.children.length === 0) {
    return 1;
  }

  const childDepths = tree.children.map(child => getMaxDepth(child));
  return 1 + Math.max(...childDepths);
}

/**
 * Valida que un árbol de nodos sea correcto
 * @param {Object} tree - Nodo raíz del árbol
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateNodeTree(tree) {
  const errors = [];

  if (!tree) {
    errors.push('El árbol no puede ser null o undefined');
    return { valid: false, errors };
  }

  const seenIds = new Set();

  function validate(node, path = 'root') {
    if (!node.id) {
      errors.push(`Nodo en ${path} no tiene ID`);
    } else if (seenIds.has(node.id)) {
      errors.push(`ID duplicado: ${node.id} en ${path}`);
    } else {
      seenIds.add(node.id);
    }

    if (typeof node.text !== 'string') {
      errors.push(`Nodo ${node.id} en ${path} no tiene texto válido`);
    }

    if (typeof node.x !== 'number' || typeof node.y !== 'number') {
      errors.push(`Nodo ${node.id} en ${path} no tiene coordenadas válidas`);
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child, idx) => {
        validate(child, `${path}.children[${idx}]`);
      });
    }
  }

  validate(tree);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Clona profundamente un árbol de nodos de forma inmutable
 * @param {Object} tree - Nodo raíz del árbol
 * @returns {Object} - Nuevo árbol clonado
 */
export function cloneTree(tree) {
  if (!tree) return null;

  return {
    ...tree,
    children: tree.children ? tree.children.map(child => cloneTree(child)) : []
  };
}

/**
 * Recorre el árbol y ejecuta una función en cada nodo
 * @param {Object} tree - Nodo raíz del árbol
 * @param {Function} fn - Función a ejecutar en cada nodo (node, depth, path)
 */
export function traverseTree(tree, fn, depth = 0, path = []) {
  if (!tree) return;

  fn(tree, depth, [...path, tree.id]);

  if (tree.children && tree.children.length > 0) {
    tree.children.forEach(child => {
      traverseTree(child, fn, depth + 1, [...path, tree.id]);
    });
  }
}

/**
 * Calcula posiciones de nodos hijos sin colisiones
 * @param {Object} parentNode - Nodo padre
 * @param {number} childrenCount - Número de nodos hijos a crear
 * @param {Object} tree - Árbol completo para verificar colisiones
 * @returns {Array} - Array de posiciones {x, y}
 */
export function calculateChildrenPositions(parentNode, childrenCount, tree) {
  const horizontalOffset = 300;
  const minVerticalSpacing = 150;
  
  // Obtener todos los nodos existentes para detectar colisiones
  const allNodes = [];
  traverseTree(tree, (node) => {
    allNodes.push(node);
  });
  
  // Calcular altura aproximada de cada nodo
  const nodeHeight = 100;
  
  // Calcular espaciado requerido
  const totalHeight = (childrenCount - 1) * minVerticalSpacing;
  const startY = -totalHeight / 2;
  
  const positions = [];
  
  for (let i = 0; i < childrenCount; i++) {
    let proposedY = parentNode.y + startY + (i * minVerticalSpacing);
    let proposedX = parentNode.x + horizontalOffset;
    
    // Verificar colisiones con otros nodos y ajustar
    let hasCollision = true;
    let adjustedY = proposedY;
    let attempts = 0;
    
    while (hasCollision && attempts < 10) {
      hasCollision = allNodes.some(node => {
        if (node.x === parentNode.x && node.y === parentNode.y) return false; // Ignorar el padre
        
        const xDist = Math.abs(proposedX - node.x);
        const yDist = Math.abs(adjustedY - node.y);
        
        // Espacio mínimo requerido entre nodos
        const minXDist = 350;
        const minYDist = 150;
        
        return xDist < minXDist && yDist < minYDist;
      });
      
      if (hasCollision) {
        adjustedY += minVerticalSpacing;
        attempts++;
      }
    }
    
    positions.push({ x: proposedX, y: adjustedY });
  }
  
  return positions;
}
