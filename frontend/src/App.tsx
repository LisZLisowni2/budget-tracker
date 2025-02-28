// import { useState } from 'react'
import Header from './components/Header/Header'
import Content from './components/Content/Content'
import Main from './components/Main/Main'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Router>
      <section className="h-screen flex text-white flex-col">
        <Header />
        <Routes>
          <Route path='/' element={<Content>
            <Main />
          </Content>} />
          </Routes>
      </section>
    </Router>
  )
}

export default App
