"use client"

import { OrganizationList, useOrganization } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { BarLoader } from 'react-spinners'


const Onboarding = () => {

    // const {organization} = useOrganization()
    // console.log("organization", organization)
    // const router = useRouter()

    // useEffect(() => {
    //     if(organization){
    //         router.push(`/organization/${organization.slug}`)
    //     }
    // }, [organization])

    let [loading, setLoading] = React.useState(false);

    const handleOrganizationSelect = (organization) => {
      setLoading(true);
      return `/organization/${organization.slug}`
    }

    if(loading){
      return <BarLoader color="#36d7b7" width="100%" />
    }

    
  return (
    <div className='flex justify-center items-center pt-14'>
        <OrganizationList hidePersonal
        fallback={<div>Loading...</div>}
        afterCreateOrganizationUrl={(organization) => handleOrganizationSelect(organization)}
        afterSelectOrganizationUrl={(organization) => handleOrganizationSelect(organization)}
          />
    </div>
  )
}

export default Onboarding