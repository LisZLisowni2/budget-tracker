// import { useState } from 'react'
import Header from './components/Header/Header'
import Content from './components/Content/Content'
import Main from './components/Main/Main'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <section className="h-screen flex text-white flex-col">
      <Header />
      <Content>
        <Main />
      </Content>
    </section>
  )
}

export default App
