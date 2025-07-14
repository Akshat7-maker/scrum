import { NextResponse } from 'next/server'
import { currentUser, auth } from '@clerk/nextjs/server'
import { db } from '@/lib/prisma'

export async function POST() {

  try {
    const user = await currentUser()
  
    console.log("backend user", user)
  
    if(!user){
      return NextResponse.json(null)
    }
  
    const userInDb = await db.user.findUnique({
      where: {
        clerkUserId: user.id
      }
    })
  
    console.log("user in db", userInDb)
  
    if(userInDb){
      return NextResponse.json(userInDb)
    }
  
  //   create user in db
    const userCreated = await db.user.create({
      data: {
        clerkUserId : user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.username
      }
    })
  
    return NextResponse.json(userCreated)
  } catch (error) {
    console.log("backend error", error)
    return NextResponse.json(null)
    
  }
  

}