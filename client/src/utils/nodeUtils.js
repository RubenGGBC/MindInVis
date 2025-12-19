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
    errors.push('Tree cannot be null or undefined');
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
 * Calcula posiciones iniciales para nodos hijos (antes de aplicar el layout dinámico)
 * Las posiciones finales serán recalculadas por applyDynamicLayout
 * @param {Object} parentNode - Nodo padre
 * @param {number} childrenCount - Número de nodos hijos a crear
 * @param {Object} tree - Árbol completo (no usado, mantenido por compatibilidad)
 * @returns {Array} - Array de posiciones {x, y}
 */
export function calculateChildrenPositions(parentNode, childrenCount, tree) {
  // Posiciones temporales - el layout dinámico las recalculará
  const positions = [];

  for (let i = 0; i < childrenCount; i++) {
    positions.push({
      x: parentNode.x + LAYOUT_CONFIG.horizontalSpacing,
      y: parentNode.y  // El layout dinámico calculará la Y correcta
    });
  }

  return positions;
}

/**
 * Resetea todas las posiciones de los nodos a sus posiciones iniciales
 * @param {Object} tree - Nodo raíz del árbol
 * @returns {Object} - Nuevo árbol con las posiciones reseteadas
 */
export function resetAllPositions(tree) {
  if (!tree) return null;

  const resetNode = {
    ...tree,
    x: tree.initialX || tree.x,
    y: tree.initialY || tree.y,
    lastModified: Date.now()
  };

  if (tree.children && tree.children.length > 0) {
    resetNode.children = tree.children.map(child => resetAllPositions(child));
  }

  return resetNode;
}

/**
 * Encuentra el nodo padre de un nodo específico
 * @param {Object} tree - Nodo raíz del árbol
 * @param {string} nodeId - ID del nodo hijo
 * @returns {Object|null} - El nodo padre encontrado o null
 */
export function findParentNode(tree, nodeId) {
  if (!tree || !tree.children) return null;

  for (const child of tree.children) {
    if (child.id === nodeId) {
      return tree;
    }
    const foundParent = findParentNode(child, nodeId);
    if (foundParent) {
      return foundParent;
    }
  }

  return null;
}

/**
 * Obtiene el camino completo (path) desde la raíz hasta un nodo específico
 * @param {Object} tree - Nodo raíz del árbol
 * @param {string} nodeId - ID del nodo objetivo
 * @returns {Array<Object>|null} - Array de nodos del path [root, ..., target] o null si no existe
 */
export function getNodePath(tree, nodeId) {
  if (!tree) return null;
  
  function findPath(node, targetId, currentPath = []) {
    const newPath = [...currentPath, node];
    
    if (node.id === targetId) {
      return newPath;
    }
    
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const foundPath = findPath(child, targetId, newPath);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    
    return null;
  }
  
  return findPath(tree, nodeId);
}

// ============================================
// LAYOUT DINÁMICO - Sistema tipo MindMeister
// ============================================

const LAYOUT_CONFIG = {
  horizontalSpacing: 300,    // Espacio horizontal entre columnas
  minVerticalSpacing: 30,    // Espacio mínimo entre nodos hermanos
  nodeHeight: 80,            // Altura base de un nodo
};

/**
 * Calcula la altura total que ocupa un subárbol (incluyendo todos sus descendientes visibles)
 * @param {Object} node - Nodo raíz del subárbol
 * @returns {number} - Altura total del subárbol en píxeles
 */
export function getSubtreeHeight(node) {
  if (!node) return 0;

  // Si el nodo está colapsado o no tiene hijos visibles, solo cuenta su propia altura
  if (node.collapsed || !node.children || node.children.length === 0) {
    return node.height || LAYOUT_CONFIG.nodeHeight;
  }

  // Calcular la altura total de todos los hijos
  let totalChildrenHeight = 0;
  for (let i = 0; i < node.children.length; i++) {
    totalChildrenHeight += getSubtreeHeight(node.children[i]);
    // Añadir espacio entre hermanos (excepto después del último)
    if (i < node.children.length - 1) {
      totalChildrenHeight += LAYOUT_CONFIG.minVerticalSpacing;
    }
  }

  // El subárbol ocupa al menos la altura del nodo padre o la de sus hijos
  const nodeHeight = node.height || LAYOUT_CONFIG.nodeHeight;
  return Math.max(nodeHeight, totalChildrenHeight);
}

/**
 * Aplica el layout dinámico a todo el árbol, reposicionando todos los nodos
 * @param {Object} tree - Nodo raíz del árbol
 * @returns {Object} - Nuevo árbol con posiciones actualizadas
 */
export function applyDynamicLayout(tree) {
  if (!tree) return null;

  // Clonar el árbol para no mutarlo
  const newTree = cloneTree(tree);

  // Aplicar layout recursivamente empezando desde la raíz
  layoutNode(newTree, newTree.x, newTree.y);

  return newTree;
}

/**
 * Aplica el layout a un nodo y todos sus descendientes
 * @param {Object} node - Nodo a posicionar
 * @param {number} x - Posición X del nodo
 * @param {number} centerY - Centro Y donde posicionar el subárbol
 */
function layoutNode(node, x, centerY) {
  // Posicionar este nodo
  node.x = x;
  node.y = centerY;
  node.initialX = x;
  node.initialY = centerY;

  // Si está colapsado o no tiene hijos, terminamos
  if (node.collapsed || !node.children || node.children.length === 0) {
    return;
  }

  // Calcular la altura total de los hijos
  const childrenHeights = node.children.map(child => getSubtreeHeight(child));
  const totalHeight = childrenHeights.reduce((sum, h, i) => {
    return sum + h + (i > 0 ? LAYOUT_CONFIG.minVerticalSpacing : 0);
  }, 0);

  // Posicionar hijos centrados verticalmente respecto al padre
  const childX = x + LAYOUT_CONFIG.horizontalSpacing;
  let currentY = centerY - totalHeight / 2;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childHeight = childrenHeights[i];

    // El centro del hijo es el punto medio de su espacio asignado
    const childCenterY = currentY + childHeight / 2;

    // Aplicar layout recursivamente al hijo
    layoutNode(child, childX, childCenterY);

    // Mover el cursor al siguiente espacio
    currentY += childHeight + LAYOUT_CONFIG.minVerticalSpacing;
  }
}

/**
 * Recalcula el layout solo para un subárbol específico y ajusta los ancestros
 * @param {Object} tree - Árbol completo
 * @param {string} nodeId - ID del nodo cuyo subárbol cambió
 * @returns {Object} - Nuevo árbol con layout actualizado
 */
export function relayoutFromNode(tree, nodeId) {
  // Por ahora, recalculamos todo el árbol para simplicidad
  // Una optimización futura sería solo recalcular lo necesario
  return applyDynamicLayout(tree);
}
