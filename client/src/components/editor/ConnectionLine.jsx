import React, { useMemo } from 'react';

/**
 * Función para encontrar el punto de intersección con el borde de un rectángulo
 */
const getEdgePoint = (centerX, centerY, width, height, angle) => {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tanAngle = Math.tan(angle);

  let x, y;

  if (Math.abs(tanAngle) <= halfHeight / halfWidth) {
    // Intersecta con lado izquierdo o derecho
    x = centerX + halfWidth * Math.sign(cos);
    y = centerY + halfWidth * tanAngle * Math.sign(cos);
  } else {
    // Intersecta con lado superior o inferior
    y = centerY + halfHeight * Math.sign(sin);
    x = centerX + halfHeight / tanAngle * Math.sign(sin);
  }

  return { x, y };
};

const ConnectionLine = ({ parentNode, childNode }) => {
  // Memoizar todos los cálculos pesados
  const lineGeometry = useMemo(() => {
    // Obtener dimensiones de los nodos
    const parentWidth = parentNode.width || 200;
    const parentHeight = parentNode.height || 80;
    const childWidth = childNode.width || 200;
    const childHeight = childNode.height || 80;

    // Centros de los nodos
    const parentCenterX = parentNode.x;
    const parentCenterY = parentNode.y;
    const childCenterX = childNode.x;
    const childCenterY = childNode.y;

    // Calcular el ángulo entre los nodos
    const dx = childCenterX - parentCenterX;
    const dy = childCenterY - parentCenterY;
    const angle = Math.atan2(dy, dx);

    // Calcular puntos de inicio y fin
    const startPoint = getEdgePoint(parentCenterX, parentCenterY, parentWidth, parentHeight, angle);
    const endPoint = getEdgePoint(childCenterX, childCenterY, childWidth, childHeight, angle + Math.PI);

    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;

    // Puntos de la flecha
    const arrowSize = 15;
    const arrowX = x2 - arrowSize * Math.cos(angle);
    const arrowY = y2 - arrowSize * Math.sin(angle);
    const arrowPointLeft = 8;
    const arrowPointAngle = Math.PI / 6;

    const leftArrowX = arrowX + arrowPointLeft * Math.cos(angle + arrowPointAngle);
    const leftArrowY = arrowY + arrowPointLeft * Math.sin(angle + arrowPointAngle);

    const rightArrowX = arrowX + arrowPointLeft * Math.cos(angle - arrowPointAngle);
    const rightArrowY = arrowY + arrowPointLeft * Math.sin(angle - arrowPointAngle);

    // Calcular el área mínima que necesitamos para el SVG
    const minX = Math.min(x1, x2, leftArrowX, rightArrowX) - 10;
    const minY = Math.min(y1, y2, leftArrowY, rightArrowY) - 10;
    const maxX = Math.max(x1, x2, leftArrowX, rightArrowX) + 10;
    const maxY = Math.max(y1, y2, leftArrowY, rightArrowY) + 10;

    const svgWidth = maxX - minX;
    const svgHeight = maxY - minY;

    return {
      x1, y1, x2, y2,
      arrowX, arrowY,
      leftArrowX, leftArrowY,
      rightArrowX, rightArrowY,
      minX, minY,
      svgWidth, svgHeight
    };
  }, [
    parentNode.x, parentNode.y, parentNode.width, parentNode.height,
    childNode.x, childNode.y, childNode.width, childNode.height
  ]);

  const {
    x1, y1, x2, y2,
    arrowX, arrowY,
    leftArrowX, leftArrowY,
    rightArrowX, rightArrowY,
    minX, minY,
    svgWidth, svgHeight
  } = lineGeometry;

  return (
    <svg
      style={{
        position: 'absolute',
        top: `${minY}px`,
        left: `${minX}px`,
        width: `${svgWidth}px`,
        height: `${svgHeight}px`,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
      }}
    >
      {/* Línea conectora */}
      <line
        x1={x1 - minX}
        y1={y1 - minY}
        x2={arrowX - minX}
        y2={arrowY - minY}
        stroke="rgba(77, 208, 225, 0.5)"
        strokeWidth="2"
        strokeDasharray="5,5"
      />

      {/* Punta de flecha */}
      <polygon
        points={`${x2 - minX},${y2 - minY} ${leftArrowX - minX},${leftArrowY - minY} ${rightArrowX - minX},${rightArrowY - minY}`}
        fill="rgba(77, 208, 225, 0.7)"
      />
    </svg>
  );
};

export default React.memo(ConnectionLine);
