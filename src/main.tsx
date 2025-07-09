import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx: Starting application...')

const rootElement = document.getElementById('root')
console.log('main.tsx: Root element found:', !!rootElement)

if (!rootElement) {
  console.error('main.tsx: Root element not found!')
  document.body.innerHTML = '<h1 style="color: red;">Error: Root element not found!</h1>'
} else {
  console.log('main.tsx: Creating React root and rendering App...')

  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.log('main.tsx: App rendered successfully')
  } catch (error) {
    console.error('main.tsx: Error rendering app:', error)
    rootElement.innerHTML = `<h1 style="color: red;">Error rendering app: ${error}</h1>`
  }
}
