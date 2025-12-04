const ConnectionLine = ({ parentNode, childNode }) => {
  const x1 = parentNode.x;
  const y1 = parentNode.y;
  const x2 = childNode.x;
  const y2 = childNode.y;

  // Calcular el ángulo y dibujar una flecha
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = 15;

  // Puntos de la flecha
  const arrowX = x2 - arrowSize * Math.cos(angle);
  const arrowY = y2 - arrowSize * Math.sin(angle);
  const arrowPointLeft = 8;
  const arrowPointAngle = Math.PI / 6;

  const leftArrowX = arrowX + arrowPointLeft * Math.cos(angle + arrowPointAngle);
  const leftArrowY = arrowY + arrowPointLeft * Math.sin(angle + arrowPointAngle);

  const rightArrowX = arrowX + arrowPointLeft * Math.cos(angle - arrowPointAngle);
  const rightArrowY = arrowY + arrowPointLeft * Math.sin(angle - arrowPointAngle);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Línea conectora */}
      <line
        x1={x1}
        y1={y1}
        x2={arrowX}
        y2={arrowY}
        stroke="rgba(77, 208, 225, 0.5)"
        strokeWidth="2"
        strokeDasharray="5,5"
      />

      {/* Punta de flecha */}
      <polygon
        points={`${x2},${y2} ${leftArrowX},${leftArrowY} ${rightArrowX},${rightArrowY}`}
        fill="rgba(77, 208, 225, 0.7)"
      />
    </svg>
  );
};

export default ConnectionLine;
