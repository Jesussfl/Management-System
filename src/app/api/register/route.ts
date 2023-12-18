import bcrypt from 'bcrypt'
import {prisma} from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request : Request) {
    const body = await request.json();
    const {username, email, password } = body;

    if(!username || !email || !password) {
        return new NextResponse('Missing Fields', { status: 400, statusText: 'Missing Fields' })
    }

    const exist = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(exist) {
        return new NextResponse('Email already exists', {  status: 400, statusText: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name: username,
            email,
            password:hashedPassword
        }
    });

    return NextResponse.json(user)
}