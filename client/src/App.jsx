import React from 'react'
 
//lo que se mostrara una vez se haya iniciado la aplicacion 
  function App() {
    return (
      <div className="app">
        <header className="header">
          <h1>MindInVis</h1>
          <p>Mind Mapping con IA</p>
        </header>

        <div className="main-container">
          <aside className="sidebar">
            <header className="headersidebar">
                <h2>Menú de Navegación</h2>
            </header>
            <ul>
                <li>
                <button>
                    Menu principal
                </button>
                </li>
                <li>
                <button>
                    Configuracion
                </button>
                </li>
            </ul>
          </aside>

          <main className="canvas-container">
            <div className="mindmap-canvas">
              <p>Aquí irá el mind map</p>
            </div>
          </main>
        </div>
      </div>
    )
  }
export default App