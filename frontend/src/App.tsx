// import { useState } from 'react'
import Header from './components/Header/Header'
import Content from './components/Content/Content'
import Main from './components/Main/Main'
import Login from './components/Login/Login'
import Register from './components/User/Register'
import Dashboard from './components/Dashboard/Dashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { UserProvide } from './context/UserContext'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function DashboardLayout() {
  return (
      <div className='flex justify-center flex-1'>
        <Dashboard>
          <Routes>
            <Route path='/' element={<p className='text-2xl'>Welcome to dashboard!</p>} />
            <Route path='/overall' element={<p className='text-2xl'>Welcome to overall!</p>} />
            <Route path='/transactions' element={<p className='text-2xl'>Welcome to transactions!</p>} />
            <Route path='/investments' element={<p className='text-2xl'>Welcome to investments!</p>} />
            <Route path='/notes' element={<p className='text-2xl'>Welcome to notes!</p>} />
            <Route path='/trends' element={<p className='text-2xl'>Welcome to trends!</p>} />
            <Route path='/profile' element={<p className='text-2xl'>Welcome to profile!</p>} />
          </Routes>
        </Dashboard>
      </div>
  )
}

function App() {
  // const [count, setCount] = useState(0)

  return (
    <UserProvide>
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
          <Route path='/dashboard/*' element={<DashboardLayout />} />
          </Routes>
      </section>
      <Route path='/register' element={<Content>
         <Register />
      </Content>}/>
      </Routes>
      </section>
    </Router>
    </UserProvide>
  )
}

export default App
