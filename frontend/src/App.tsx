// import { useState } from 'react'
import Header from './components/Header/Header'
import Content from './components/Content/Content'
import Main from './components/Main/Main'
import Login from './components/Login/Login'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Router>
      <section className="min-h-screen flex text-white flex-col bg-gray-200">
        <Header />
        <Routes>
          <Route path='/' element={<Content>
            <Main />
          </Content>} />
          <Route path='/login' element={<Content>
            <Login />
          </Content>}/>
          </Routes>
      </section>
    </Router>
  )
}

export default App
