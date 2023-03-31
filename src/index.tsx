import React from 'react'
import ReactDOM from 'react-dom/client'

import { ChatApp } from './App'

// ! the only css imports in ts/x files
import './css/index.scss'
import 'reactflow/dist/style.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

if (process.env.REACT_APP_DEV_IDE === 'code')
  root.render(
    <React.StrictMode>
      <ChatApp />
    </React.StrictMode>
  )
// root.render(<ReactFlowComponent />)
else if (process.env.REACT_APP_DEV_IDE === 'jet') {
  // ! only try to load react-buddy related components whn the dev ide is IntelliJ
  // import('./dev').then(m => {
  //   const ComponentPreviews = m.ComponentPreviews
  //   const useInitialHook = m.useInitial
  //   root.render(
  //     <React.StrictMode>
  //       <DevSupport
  //         ComponentPreviews={ComponentPreviews}
  //         useInitialHook={useInitialHook}
  //       >
  //         <ReactFlowComponent />
  //       </DevSupport>
  //     </React.StrictMode>
  //   )
  // })
}
