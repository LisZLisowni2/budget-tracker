// import { useState } from 'react'
import Header from './components/Header/Header'
import Content from './components/Content/Content'
import HeroBox from './components/Main/HeroBox'
import ReasonsBox from './components/Main/ReasonsBox'
import WhyBox from './components/Main/WhyBox'
import Login from './components/User/Login'
import Register from './components/User/Register'
import Dashboard from './components/Dashboard/Dashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { UserProvide } from './context/UserContext'
import Profile from './components/Dashboard/Profile'
import Overall from './components/Dashboard/Overall'
import Footer from './components/Footer/Footer'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function DashboardLayout() {
  return (
      <div className='flex flex-1'>
        <Dashboard>
          <Routes>
            <Route path='/overall' element={<Overall />} />
            <Route path='/transactions' element={<p className='text-2xl'>Welcome to transactions!</p>} />
            <Route path='/investments' element={<p className='text-2xl'>Welcome to investments!</p>} />
            <Route path='/notes' element={<p className='text-2xl'>Welcome to notes!</p>} />
            <Route path='/trends' element={<p className='text-2xl'>Welcome to trends!</p>} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/' element={<Profile />} />
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
      <section className="min-h-screen flex text-white flex-col bg-gradient-to-r from-gray-100 to-gray-200">
        <Header />
        <Routes>
          <Route path='/' element={<div className='flex-col justify-center items-center'>
              <div className='flex justify-center p-60'>
                <HeroBox />
              </div>
              <div className='max-md:flex-col flex lg justify-between bg-white shadow-2xl'>
                <ReasonsBox />
                <WhyBox />
              </div>
            </div>} />
          <Route path='/login' element={<Content>
            <Login />
          </Content>}/>
          <Route path='/dashboard/*' element={<DashboardLayout />} />
          <Route path='/register' element={<Content>
            <Register />
          </Content>}/>
        </Routes>
        <Footer />
      </section>
    </Router>
    </UserProvide>
  )
}

export default App
