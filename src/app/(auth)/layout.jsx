import React from 'react'

function SignedInLayout({children}) {
  return (

    <div className='flex justify-center items-center'>
        {children}
    </div>
    
  )
}

export default SignedInLayout